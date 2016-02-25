import os
import re
import ssl
from bs4 import BeautifulSoup
from operator import itemgetter
from selenium.webdriver.support.ui import Select
from urllib.request import urlopen

# Configuration
verbose = False
output_files = []
errors = []
scraped_courses = {}

# Regular expression to get course codes
regex_courses = re.compile(r'<a.*?>([A-Z]{3}[0-9]{4}.*?)<\/a>.*?class=\"Faculty\">(.*?)<\/td>')
# Regular expression to get the day of the week
regex_day = re.compile(r'([A-Za-z]{3,6}day)')
# Regular expression to get the start and end time of an activity
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
				try:
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
					classes.append((session_id, course_name, course_code, section, activity, day, start_time, end_time, room, professor))
				except Exception as e:
					print_verbose_message('Error parsing course:', course_code)
					errors.append('Error parsing course: {0}. {1}'.format(course_code, e))
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

			# Don't scrape the same course twice
			if course_code in scraped_courses:
				scraped_courses[course_code] += 1
				continue
			else:
				scraped_courses[course_code] = 1

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
					'name': course[1],
					'code': course[2],
					'section': course[3],
					'type': course[4],
					'day': course[5],
					'start_time': course[6],
					'end_time': course[7],
					'room': course[8],
					'professor': course[9]
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

		# Attempt to keep going to the next page
		browser.execute_script('__doPostBack("ctl00$MainContentPlaceHolder$ctl05","")')
		if 'ErrorInternal' in browser.current_url:
			# When this appears in the url, there are no more courses
			print_verbose_message('Finished scraping courses')
			break

	for session in sessions:
		# Create a folder for each session
		if not os.path.exists(session):
			print_verbose_message('Creating new session folder:', session)
			os.makedirs(session)

		for faculty in sessions[session]:
			print_verbose_message('Printing faculty to file:', faculty['name'])

			# Delete the file with the faculty courses if it already exists
			filename = os.path.join(session, '{0}.csv'.format(faculty['name']))
			try:
				if os.path.isfile(filename):
					os.unlink(filename)
			except Exception as e:
				print(e)
			output_files.append(filename)

			# Sort the courses by their course code
			faculty['courses'] = sorted(faculty['courses'], key=itemgetter('code', 'section'))

			# Open the file to print to
			with open(filename, 'w', encoding='utf8') as outfile:
				outfile.write('CODE,SECTION,TYPE,DAY,START,END,ROOM,NAME,PROFESSOR\n')

				# Iterate through each of the courses available in the faculty
				for course in faculty['courses']:
					outfile.write('{0},{1},{2},{3},{4},{5},{6},{7},{8}\n'.format(
						course['code'],
						course['section'],
						course['type'],
						course['day'],
						course['start_time'],
						course['end_time'],
						course['room'],
						course['name'],
						course['professor']
					))


	# Output any errors so the user is aware
	if len(errors) > 0:
		print_verbose_message(str(len(errors)), 'errors were encountered. Printing messages below.')
		for error in errors:
			print_verbose_message('ERROR:', error)
