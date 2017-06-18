from selenium import webdriver
options = webdriver.ChromeOptions()
options.binary_location = '/usr/bin/google-chrome-unstable'
options.add_argument('headless')
options.add_argument('disable-gpu')
options.add_argument('window-size=1200x600')
driver = webdriver.Chrome(chrome_options=options)
driver.get('https://facebook.com')
driver.implicitly_wait(10)
email = driver.find_element_by_css_selector('input[type=email]')
password = driver.find_element_by_css_selector('input[type=password]')
login = driver.find_element_by_id('loginbutton')

driver.execute_script("document.getElementById('email').value=''")
driver.execute_script("document.getElementById('pass').value=''")
login.click()

driver.get_screenshot_as_file('test1.png')
