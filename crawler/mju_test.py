from headless_mju_crawler import *
options = webdriver.ChromeOptions()
options.binary_location='/usr/bin/google-chrome-unstable'
options.add_argument('headless')
options.add_argument('window-size=1200x800')
driver = webdriver.Chrome(chrome_options=options)
driver.get('http://myiweb.mju.ac.kr')
mju_id = driver.find_element_by_id('userID')
mju_pw = driver.find_element_by_id('userPW')
driver.execute_script('document.getElementById("userID").value=""')
driver.execute_script('document.getElementById("userPW").value=""')
driver.execute_script('CheckSubmit()')
driver.get("https://myiweb.mju.ac.kr/servlet/MyLocationPage?link=/su/sue/sue01/w_sue337pr.jsp")
Select(driver.find_element_by_name("dept_cd")).select_by_value('12913')
driver.execute_script("thisPage1()")

resize_page(driver)
find_end = driver.find_element_by_class_name("crownix-pagenum")
endpage = int(find_end.text.split(" ")[2])
