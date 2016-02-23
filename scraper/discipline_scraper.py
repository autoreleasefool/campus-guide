import json
import re
from operator import itemgetter
from selenium.webdriver.support.ui import Select

# Configuration
verbose = False
output_filename = 'disciplines.json'

# Update the level of verbosity to use (either True or False)
def set_verbosity(verbosity):
	global verbose
	verbose = verbosity

# Update the filename to output results to
def set_output_filename(filename):
	global output_filename
	output_filename = filename

# Navigates back one page in the browser
def browser_back(browser):
	browser.execute_script("window.history.go(-1)")

# Prints a message if the verbose flag was provided
def print_verbose_message(*messages):
	if verbose:
		print(' DISC\t', ' '.join(messages))

# Returns a set of formatted faculty names from a regex match of course codes and full faculty names
def parse_faculties(matched_courses):
	faculties = set()
	for course in matched_courses:
		if 'Arts' in course[1]:
			faculties.add('arts')
		elif 'Engineering' in course[1]:
			faculties.add('engineering')
		elif 'Medicine' in course[1]:
			faculties.add('medicine')
		elif 'Telfer' in course[1]:
			faculties.add('telfer')
		elif 'Grad' in course[1]:
			faculties.add('graduate')
		elif 'Law' in course[1]:
			faculties.add('law')
		elif 'Social Science' in course[1]:
			faculties.add('socialsciences')
		elif 'Health Science' in course[1]:
			faculties.add('healthsciences')
		elif 'Education' in course[1]:
			faculties.add('education')
		elif 'Science' in course[1]:
			faculties.add('science')
	return faculties

# Scrapes uOttawa for a list of disciplines and saves relevant data to disciplines.json
def get_disciplines(browser):
	print_verbose_message('Starting scrape for disciplines.')

	# Regular expression to get course codes and faculties
	regex_courses = re.compile(r'<a.*?>([A-Z]{3}[0-9]{4}.*?)<\/a>.*?<td class="Faculty">(.*?)<\/td>')

	# Starting url for the scrape
	initial_url = 'https://web30.uottawa.ca/v3/SITS/timetable/Search.aspx'

	# Open the initial url
	print_verbose_message('Opening url:', initial_url)
	browser.get(initial_url)

	# Getting the discipline names and codes
	print_verbose_message('Retrieving English discipline names')
	dropdown_id = 'ctl00_MainContentPlaceHolder_Basic_SubjectDropDown'
	discipline_dropdown = Select(browser.find_element_by_id(dropdown_id))
	discipline_codes_to_en_names = {x.get_attribute('value'): x.text for x in discipline_dropdown.options}

	# Now, get the names in french
	print_verbose_message('Retrieving French discipline names')
	browser.execute_script('WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions("ctl00$ChLangUrlLinkButton1", "fr-CA", false, "", "", false, true))')
	discipline_dropdown = Select(browser.find_element_by_id(dropdown_id))
	discipline_codes_to_fr_names = {x.get_attribute('value'): x.text for x in discipline_dropdown.options}

	# Return to english now
	browser.execute_script('WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions("ctl00$ChLangUrlLinkButton1", "en-CA", false, "", "", false, true))')

	disciplines = []
	disciplines_scraped = 1
	total_disciplines = len(discipline_codes_to_en_names.keys())
	for code in discipline_codes_to_en_names:
		if code == '':
			continue
		print_verbose_message('Scraping discipline ({0}/{1}):'.format(disciplines_scraped, total_disciplines), discipline_codes_to_en_names[code])

		# Set the next discipline to be scraped and load its search page
		discipline_dropdown = Select(browser.find_element_by_id(dropdown_id))
		discipline_dropdown.select_by_value(code)
		browser.find_element_by_id('ctl00_MainContentPlaceHolder_Basic_Button').click()

		# Each discipline belongs to a set of faculties, so this will just track those
		faculties = set()

		while True:
			# Find all the courses loaded on the page and get the faculty that course belongs to
			raw_courses = re.findall(regex_courses, browser.page_source)
			new_faculties = parse_faculties(raw_courses)

			# Save the faculties from the course to the list of faculties the discipline belongs to
			faculties = faculties.union(new_faculties)

			# Attempt to keep going to the next page
			browser.execute_script('__doPostBack("ctl00$MainContentPlaceHolder$ctl05","")')
			if 'ErrorInternal' in browser.current_url:
				# When this appears in the url, there are no more courses
				# Return to the initial_url and scrape the next course code
				browser.get(initial_url)
				print_verbose_message('Finished scraping discipline:', discipline_codes_to_en_names[code])
				break

		# Once the scrape for a discipline is complete, add the data to a list of disciplines to be saved
		disciplines.append({'name_en': discipline_codes_to_en_names[code], 'name_fr': discipline_codes_to_fr_names[code], 'code': code, 'faculties': '|'.join(faculties)})
		disciplines_scraped += 1

	# Sorting the disciplines so they are printed in alphabetical order by their code
	print_verbose_message('All disciplines scraped, formatting and printing.')
	formatted_disciplines = {'Disciplines': []}
	for discipline in disciplines:
		disc_entry = {'name_en': discipline['name_en'], 'name_fr': discipline['name_fr'], 'code': discipline['code'], 'faculties': discipline['faculties']}
		formatted_disciplines['Disciplines'].append(disc_entry)
	formatted_disciplines['Disciplines'] = sorted(formatted_disciplines['Disciplines'], key=itemgetter('code'))

	print_verbose_message('Saving to', output_filename)
	with open(output_filename, 'w', encoding='utf8') as outfile:
	    json.dump(formatted_disciplines, outfile, indent=4, sort_keys=True)
