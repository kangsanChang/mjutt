from selenium import webdriver
options = webdriver.ChromeOptions()
options.binary_location = '/usr/bin/google-chrome-unstable'
options.add_argument('headless')
driver = webdriver.Chrome(chrome_options=options)
driver.get('https://faebook.com')
driver.implicitly_wait(10)

eemail = driver.find_element_by_css_selector('input[type=email]')
password = driver.find_element_by_css_selector('input[type=password]')
login = driver.find_element_by_id('loginbutton')

email.send_keys('myid')
password.send_keys('mypw')

driver.get_screenshot_as_file('main-page.png')

