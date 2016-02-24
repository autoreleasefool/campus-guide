import os
import re
import ssl
from bs4 import BeautifulSoup
from selenium.webdriver.support.ui import Select
from urllib.request import urlopen

# Configuration
verbose = False
output_files = []
errors = []

# Regular expression to get course codes
regex_courses = re.compile(r'<a.*?>([A-Z]{3}[0-9]{4}.*?)<\/a>.*?class=\"Faculty\">(.*?)<\/td>')
regex_day = re.compile(r'([A-Za-z]{3,6}day)')
regex_time = re.compile(r'([012][0-9]:[0-9]{2}) - ([012][0-9]:[0-9]{2})')

# Update the level of verbosity to use (either True or False)
def set_verbosity(verbosity):
	global verbose
	verbose = verbosity

# Returns the list of filenames which output was printed to
def get_output_files():
	return output_files

# Prints a message if the verbose flag was provided
def print_verbose_message(*messages):
	if verbose:
		print(' COURSE\t', ' '.join(messages))

# Gets a shortened version of a faculty name
# Invalid faculty names return None
def get_faculty_shorthand(faculty):
	if 'Arts' in faculty:
		return 'arts'
	elif 'Engineering' in faculty:
		return 'engineering'
	elif 'Medicine' in faculty:
		return 'medicine'
	elif 'Telfer' in faculty:
		return 'telfer'
	elif 'Grad' in faculty:
		return 'graduate'
	elif 'Law' in faculty:
		return 'law'
	elif 'Social Science' in faculty:
		return 'socialsciences'
	elif 'Health Science' in faculty:
		return 'healthsciences'
	elif 'Education' in faculty:
		return 'education'
	elif 'Science' in faculty:
		return 'science'
	else:
		return None

# Gets a number from 0-6 based on the day of the week where Sunday is 0 and Saturday is 6
# A day which is not real returns None
def get_numeric_day_of_week(day):
	if day == 'Sunday':
		return 0
	elif day == 'Monday':
		return 1
	elif day == 'Tuesday':
		return 2
	elif day == 'Wednesday':
		return 3
	elif day == 'Thursday':
		return 4
	elif day == 'Friday':
		return 5
	elif day == 'Saturday':
		return 6
	else:
		return None

# Gets the section information from a course page
def parse_course_info(course_code, course_soup):
	classes = []

	# Find the name of the course
	course_name = re.search(r'<h1>' + re.escape(course_code) + r' - (.*?)<\/h1>', str(course_soup))
	if not course_name:
		print_verbose_message('Unable to find name for course:', course_code)
		errors.append('Unable to find name for course: ' + course_code)
		return []
	else:
		course_name = course_name.group(1)
		print_verbose_message('Found course name:', course_name)

	sessions = course_soup.findAll('div', class_='schedule')
	for session in sessions:
		# Save the id of the session
		session_id = session.get('id')

		for table in session.findAll('table'):
			# Retrieving data on all courses
			sections = table.findAll('td', class_='Section')
			activities = table.findAll('td', class_='Activity')
			days = table.findAll('td', class_='Day')
			locations = table.findAll('td', class_='Place')
			professors = table.findAll('td', class_='Professor')
			last_valid_section = 0

			for i in range(len(sections)):
				section = re.search(re.escape(course_code) + r'\s*(.*?)\s*\(', sections[i].getText())
				if not section:
					# Not a valid section, meaning it's an add-on to the last section
					section = last_valid_section
				else:
					# Get the section text
					section = section.group(1)
					last_valid_section = section
				activity = activities[i].getText()
				day = get_numeric_day_of_week(re.search(regex_day, days[i].getText()).group(1))
				time = re.search(regex_time, days[i].getText())
				start_time = time.group(1)
				end_time = time.group(2)
				room = locations[i].getText()
				professor = professors[i].getText()

				# Put all the data scraped in a list of tuples to return
				classes.append((session_id, course_code, section, activity, day, start_time, end_time, room, professor))
	return classes

# Prints a list of courses and section info to files
def get_courses(browser):
	print_verbose_message('Starting scrape for courses.')

	# URLs for the scrape
	initial_url = 'https://web30.uottawa.ca/v3/SITS/timetable/Search.aspx'
	course_url = 'https://web30.uottawa.ca/v3/SITS/timetable/Course.aspx?code={0}'

	# Load the initial page
	print_verbose_message('Opening url:', initial_url)
	browser.get(initial_url)

	# Click the search button to get ALL courses for all available semesters
	browser.find_element_by_id('ctl00_MainContentPlaceHolder_Basic_Button').click()

	# Each session (Fall 2015/Winter 2016/etc.) are represented by a unique integer ID
	sessions = {}

	while True:
		raw_courses = re.findall(regex_courses, browser.page_source)
		print_verbose_message('Found', str(len(raw_courses)), 'courses on page, now parsing.')

		for raw_course in raw_courses:
			# Scrape the course page for name, faculty, etc.
			course_code = raw_course[0]
			course_code_url = course_url.format(course_code)
			course_faculty = get_faculty_shorthand(raw_course[1])

			# Opening course page
			print_verbose_message('Opening url:', course_code_url)
			ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLSv1)
			url_response = urlopen(course_code_url, context=ssl_context)
			course_html = url_response.read().decode('utf-8')

			# Retrieving information about the sections of the course
			courses = parse_course_info(course_code, BeautifulSoup(course_html, 'html.parser'))
			print_verbose_message('Found', str(len(courses)), 'instances of', course_code)

			for course in courses:
				if course[0] not in sessions:
					sessions[course[0]] = []

				final_course = {
					'code': course[1],
					'section': course[2],
					'type': course[3],
					'day': course[4],
					'start_time': course[5],
					'end_time': course[6],
					'room': course[7],
					'professor': course[8]
				}

				found_faculty = False
				for faculty in sessions[course[0]]:
					if course_faculty == faculty['name']:
						found_faculty = True
						faculty['courses'].append(final_course)

				if not found_faculty:
					sessions[course[0]].append({
						'name': course_faculty,
						'courses': [final_course]
					})

				print_verbose_message('Parsed course:', str(final_course))

		# Attempt to keep going to the next page
		browser.execute_script('__doPostBack("ctl00$MainContentPlaceHolder$ctl05","")')
		if 'ErrorInternal' in browser.current_url:
			# When this appears in the url, there are no more courses
			print_verbose_message('Finished scraping courses')
			break

	for session in sessions:
		session_str = str(session)
		# Create a folder for each session

		if not os.path.exists(session_str):
			print_verbose_message('Creating new session folder:', session_str)
			os.makedirs(session_str)

		# Remove any existing files in the session folder
		print_verbose_message('Removing old files in folder:', session_str)
		for the_file in os.listdir(session_str):
			file_path = os.path.join(session_str, the_file)
			try:
				if os.path.isfile(file_path):
					os.unlink(file_path)
			except Exception as e:
				print(e)

		for faculty in sessions[session]:
			print_verbose_message('Printing faculty to file:', faculty['name'])
			filename = '{0}/{1}.csv'.format(session_str, faculty['name'])
			output_files.append(filename)

			# Open the file to print to
			with open(filename, 'w', encoding='utf8') as outfile:
				outfile.write('COURSE CODE,SECTION,TYPE,DAY,STARTTIME,ENDTIME,ROOM,PROFESSOR\n')

				# Iterate through each of the courses available in the faculty
				for course in faculty['courses']:
					outfile.write('{0},{1},{2},{3},{4},{5},{6},{7}\n'.format(
						course['code'],
						course['section'],
						course['type'],
						course['day'],
						course['start_time'],
						course['end_time'],
						course['room'],
						course['professor']
					))


	# Output any errors so the user is aware
	if len(errors) > 0:
		print_verbose_message(str(len(errors)), 'errors were encountered. Printing messages below.')
		for error in errors:
			print_verbose_message('ERROR:', error)
