import sys
from selenium import webdriver

if len(sys.argv) == 1:
	# Output instructions to use the scraper, then exit
	print('\n\tWelcome to the uOttawa Campus Guide web scraping tool.')
	print('\tTo use this tool, you\'ll need to provide some arguments.\n')
	print('\t--courses\tRetrieve a list of all courses available at the University of Ottawa')
	print('\t-c\t\tSee --courses')
	print('\t--disciplines\tRetrieve a list of disciplines available at the University of Ottawa')
	print('\t-d\t\tSee --disciplines')
	print('\t--exams\tRetrieve a list of exams in the current semester at the University of Ottawa')
	print('\t-e\t\tSee --exams')
	print('\t--verbose\tProvide in depth logs as the tool executes')
	print('\t-v\t\tSee --verbose')
	print()
	exit()

# Configuration
verbose = False
retrieve_disciplines = False
retrieve_courses = False
retrieve_exams = False
output_files = []

# Check for arguments and update configuration as necessary
if '--courses' in sys.argv or '-c' in sys.argv:
	retrieve_courses = True
if '--disciplines' in sys.argv or '-d' in sys.argv:
	retrieve_disciplines = True
if '--exams' in sys.argv or '-e' in sys.argv:
	retrieve_exams = True
if '--verbose' in sys.argv or '-v' in sys.argv:
	verbose = True

# Initializing browser
browser = webdriver.Chrome()

if retrieve_disciplines:
	import discipline_scraper
	discipline_scraper.set_verbosity(verbose)
	discipline_scraper.set_output_filename('disciplines.json')
	output_files.append('disciplines.json')
	discipline_scraper.get_disciplines(browser)

if retrieve_courses:
	import course_scraper
	course_scraper.set_verbosity(verbose)
	course_scraper.get_courses(browser)
	output_files = output_files + course_scraper.get_output_files()

if retrieve_exams:
	import exam_scraper
	exam_scraper.set_verbosity(verbose)
	exam_scraper.get_exams(browser)
	output_files = output_files + exam_scraper.get_output_files()

# Clean up
print('Finished executing. See output files for results.')
print('Output files:', sorted(output_files))
browser.quit()
