import os
import re
import ssl
import time
from bs4 import BeautifulSoup
from operator import itemgetter
from selenium.webdriver.support.ui import Select
from urllib.request import urlopen

# Configuration
verbose = False
output_files = []
scraped_exams = {}
local_timezone = None

# Regular expression to get course codes for exams
regex_exams = re.compile(r'<a.*?>([A-Z]{3}[0-9]{4}.*?)<\/a>.*?class=\"Faculty\">(.*?)<\/td>')

# Setting the
date_format = '%B %d, %Y %I:%M %p'

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
		print(' EXAM\t', ' '.join(messages))

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

# Returns a date in milliseconds since the epoch
def format_date(raw_date):
	return int(time.mktime(time.strptime(raw_date, date_format)))

def adjust_timezone(session_time):
	global local_timezone

	# Save the local timezone so it can be restored
	if not local_timezone:
		local_timezone = os.environ['TZ']

	# Set the timezone depending on the exam session being parsed
	timezone = 'EDT'
	if 'Fall' in session_time:
		timezone = 'EST'

	# If the timezone is already set, don't bother updating it again
	if 'TZ' in os.environ and timezone == os.environ['TZ']:
		return

	# Change the timezone and update Python's environment
	print_verbose_message('Changing timezone to {0}.'.format(timezone))
	os.environ['TZ'] = timezone
	time.tzset()
	return timezone

# Gets the section information from an exam page
def parse_exam_info(session_time, course_code, exam_soup):
	exams = []

	for table in exam_soup.findAll('table', class_='display exams'):
		sections = table.findAll('td', class_='Section')
		dates = table.findAll('td', class_='Date')
		locations = table.findAll('td', class_='Place')
		last_valid_section = None
		last_valid_professor = None

		for i in range(len(sections)):
			# Get the section and professor and use the last ones if they aren't defined for this exam instance
			section = sections[i].find('strong', class_='section')
			if not section:
				section = last_valid_section
				professor = last_valid_professor
			else:
				section = section.getText()
				last_valid_section = section
				section_text = sections[i].getText()
				professor = section_text[section_text.index(section) + len(section):]
				last_valid_professor = professor

			# Get other info about the exam
			timezone = adjust_timezone(session_time)
			date = format_date(dates[i].getText())
			if timezone == 'EDT':
				date += 60 * 60 * 4
			else:
				date += 60 * 60 * 5
			date = str(date)
			location = locations[i].getText()

			# Put all the data scraped in a list of tuples to return
			exams.append((section, date, location, professor))

	return exams

# Prints a list of exams to files
def get_exams(browser):
	global local_timezone
	print_verbose_message('Starting scrape for exams.')

	# Save the current timezone
	local_timezone = time.strftime('%Z', time.gmtime())

	# URLs for the scrape
	initial_url = 'https://web30.uottawa.ca/v3/SITS/timetable/ExamSearch.aspx'
	base_exam_url = 'https://web30.uottawa.ca/v3/SITS/timetable/Exam.aspx?code={0}&session={1}'

	# Load the initial page
	print_verbose_message('Opening url:', initial_url)
	browser.get(initial_url)

	# Get the list of sessions for which exam schedules are currently available
	print_verbose_message('Retrieving list of sessions to scrape.')
	dropdown_id = 'ctl00_MainContentPlaceHolder_Basic_SessionDropDown'
	session_select = Select(browser.find_element_by_id(dropdown_id))
	sessions = {x.get_attribute('value') + ':' + x.get_attribute('innerHTML'): [] for x in session_select.options}

	session_count = 1
	for session in sessions:
		session_id = session[:session.index(':')]
		session_time = session[session.index(':') + 1:]

		print_verbose_message('Beginning session scrape: {0} ({1}/{2})'.format(session_id, session_count, len(sessions)))

		# Select the session to scrape
		session_select = Select(browser.find_element_by_id(dropdown_id))
		session_select.select_by_value(session_id)

		# Click the search button to get the list of courses with exams this session
		browser.find_element_by_id('ctl00_MainContentPlaceHolder_Basic_Button').click()

		while True:
			# Get the list of exams on the current page
			raw_exams = re.findall(regex_exams, browser.page_source)
			print_verbose_message('Found', str(len(raw_exams)), 'exams on page, now parsing.')

			for raw_exam in raw_exams:
				# Scrape the course page for name, faculty, etc.
				course_code = raw_exam[0]

				# Don't scrape the same course twice
				if course_code in scraped_exams:
					scraped_exams[course_code] += 1
					continue
				else:
					scraped_exams[course_code] = 1

				course_exam_url = base_exam_url.format(course_code, session_id)
				exam_faculty = get_faculty_shorthand(raw_exam[1])

				# Opening exam page
				print_verbose_message('Opening url:', course_exam_url)
				ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLSv1)
				url_response = urlopen(course_exam_url, context=ssl_context)
				exam_html = url_response.read().decode('utf-8')

				# Retrieving information about the exams of the course
				exams = parse_exam_info(session_time, course_code, BeautifulSoup(exam_html, 'html.parser'))
				print_verbose_message('Found', str(len(exams)), 'instances of', course_code)

				for exam in exams:
					final_exam = {
						'code': course_code,
						'section': exam[0],
						'date': exam[1],
						'room': exam[2],
						'professor': exam[3]
					}

					found_faculty = False
					for faculty in sessions[session]:
						if exam_faculty == faculty['name']:
							found_faculty = True
							faculty['exams'].append(final_exam)

					if not found_faculty:
						sessions[session].append({
							'name': exam_faculty,
							'exams': [final_exam]
						})

			# Attempt to keep going to the next page
			browser.execute_script('__doPostBack("ctl00$MainContentPlaceHolder$ctl05","")')
			if 'ErrorInternal' in browser.current_url:
				# When this appears in the url, there are no more courses
				print_verbose_message('Finished scraping courses for session:', session_id)
				browser.get(initial_url)
				break

	for session in sessions:
		session_id = session[:session.index(':')]
		session_time = session[session.index(':') + 1:]

		# Create a folder for each session
		if not os.path.exists(session_id):
			print_verbose_message('Creating new session folder:', session_id)
			os.makedirs(session_id)

		for faculty in sessions[session]:
			print_verbose_message('Printing faculty exams to file:', faculty['name'])

			# Delete the file with the faculty exams if it already exists
			filename = os.path.join(session_id, '{0}_exams.csv'.format(faculty['name']))
			try:
				if os.path.isfile(filename):
					os.unlink(filename)
			except Exception as e:
				print(e)
			output_files.append(filename)

			# Sort the exams by their course code
			faculty['exams'] = sorted(faculty['exams'], key=itemgetter('code', 'section'))

			# Open the file to print to
			with open(filename, 'w', encoding='utf8') as outfile:
				outfile.write('CODE,SECTION,DATE,ROOM,PROFESSOR\n')

				# Iterate through each of the exams available in the faculty
				for exam in faculty['exams']:
					outfile.write('{0},{1},{2},{3},{4}\n'.format(
						exam['code'],
						exam['section'],
						exam['date'],
						exam['room'],
						exam['professor']
					))

	print_verbose_message('Changing timezone to {0}.'.format(local_timezone))
	os.environ['TZ'] = local_timezone
	time.tzset()
