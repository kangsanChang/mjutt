from selenium import webdriver
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait  # available since 2.4.0
from selenium.webdriver.support import expected_conditions as EC  # available since 2.26.0
from selenium.common.exceptions import NoSuchElementException  # for exception handling
from selenium.webdriver.common.by import By
import time
import re
import psycopg2  # for CRUD to DB
import os
from switcher import *  # name to code

# accept alert when attempt to login
def accept_alert(driver):
    try:
        WebDriverWait(driver, 10).until(EC.alert_is_present())
        alert = driver.switch_to_alert()
        alert.accept()
        print("alert accepted")
    except:
        print("no alert")

# Connect to DB & t to DB
def insert_to_DB(data):
    # try:
    #     connect_str="dbname='{}' user='{}' host='{}' password='{}'".format(
    #         os.environ['MJUTT_NAME'],
    #         os.environ['MJUTT_USER'],
    #         os.environ['MJUTT_HOST'],
    #         os.environ['MJUTT_PW']
    #     )
    #     conn = psycopg2.connect(connect_str)
    #
    # except psycopg2.Error as e:
    #     print("Unable to connect to the database")
    #     print(e)

    # cur = conn.cursor()
    SQL = "INSERT INTO classitem (grade, classname, krcode, credit, timeperweek, prof, classcode, limitstud, " \
          "time, note, dept) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"
    # testcode
    # print("DB 저장하는 query")
    print(data)
    # cur.execute(SQL, data)
    # conn.commit()

# Resize to crawl
def resize_page(driver):
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "crownix-toolbar-ratio")))
    fullscreen = driver.find_element_by_xpath("//div[@class='crownix-toolbar-icon-color']/a")
    fullscreen.click()
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "crownix-toolbar-height")))
    align_vertical = driver.find_element_by_id("crownix-toolbar-height")
    align_vertical.click()

def create_item():
    seq = ['grade', 'classname', 'krcode', 'credit', 'timeperweek', 'classcode', 'limit', 'dept']
    addlist = {'prof': [], 'time': [], 'note': []}

    dictionary = dict.fromkeys(seq, '')  # create dict and init with ''
    dictionary.update(addlist)  # add list
    return dictionary

def init_height():
    seq = ['limit', 'note']
    dictionary = dict.fromkeys(seq, '')
    return dictionary

def item_to_list(item, dept):
    item['dept'] = dept # 과 정보는 db에 넣기 전 여기서 넣고 바로 list로 보냄
    itemlist = [item['grade'], item['classname'], item['krcode'], item['credit'],
                item['timeperweek'], "".join(item['prof']), item['classcode'],
                item['limit'], ", ".join(item['time']), "".join(item['note']),
                "".join(item['dept'])]

    return itemlist

# Global variables (type : Dict.)
item = create_item()
page_lastitem = create_item()
item_height = init_height()

# page_lastitem랑 첫 시작일 때 code랑  비교하기 위해서 따로 저장

def crawling_page(driver, dept, end=None):
    global item, item_height, page_lastitem

    resize_page(driver)
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located(
        (By.ID, 'm2soft-crownix-text')))  # visibility_of_element_located(locator), locator is tuple of (by, path)
    context = driver.find_elements_by_xpath("//div[@id='m2soft-crownix-text']/div")
    option = {'append_on': '0', 'prev': '', 'note_stack': 0, 'note_init': False}
    # option은 한 페이지 긁을 동안 살아있는 value

    for i in range(len(context)):
        attr = context[i].get_attribute("style")
        x_pos = re.search('(left:) (\d{2,3})', attr)
        # left(x좌표)의 position(px)를 가져오는 정규식, position은 2자리 or 3자리 수
        y_pos = re.search('(top:) (\d{3,4})', attr)
        # top(y좌표)의 position(px)를 가져오는 정규식, position은 3자리 or 4자리 수

        pos = (x_pos.groups()[1], y_pos.groups()[1])  # position tuple (x,y)

        text = context[i].text

        if text in ('년', '학년', '교과목명', '한글코드', '학점', '시간', '담당교수', '강좌번호', '제한인원', '시간(강의실)', '비  고'):
            # 표의 index 제거,'년' 삭제 , 아래 코드에서 '전학'-> '전학년'
            continue
        elif pos[0] in ('259', '347', '584'):
            # '강의시간표', 출력일자, pagenum 제거
            continue
        elif pos[0] == "34":
            if text in ('전학년', '1학년', '2학년', '3학년', '4학년'):
                fill_item(driver, dept, pos, text, option)
            elif text == '전학':
                text = "전학년"
                fill_item(driver, dept, pos, text, option)
            else:
                # '2017 학년도 1학기   컴퓨터공학과' 같은 것 제거
                continue
        else:
            fill_item(driver, dept, pos, text, option)

        if(i == len(context)-5):
            # page last elem (end of for loop)
            # excepted last 4 elem is not in table row
            page_lastitem = item

    # 마지막 페이지 마지막 item 일 경우 : Insert to  Database
    if end:
        insert_to_DB(item_to_list(item, dept))
        # item = create_item()  # for Initialize when 자캠 - > 인캠

    # init
    item = create_item()  # init when page finished
    page_lastitem = create_item() # init when page finished
    item_height = init_height()

def compare_stack(height, option):
    if item_height['note'] != '':
        # item height가 비어있지 않으면.. (note 한번도 이상 갔으면)

        # classcode랑 같거나 아주 조금 차이나게 있을 경우 (그런경우는 아직 못봄 안전빵)
        if abs(item_height['note'] - height) <= 5:
            return
        elif item_height['note'] > height:
            # classcode가 더 위에 있을 경우
            option['note_stack'] += 1
        # classcode 가 더 밑에 있을 경우
        elif item_height['note'] < height:
            option['note_stack'] -= 1

        if option['note_stack'] == 0:
            option['note_init'] = True  # intsert 후 note 비워주도록 하는 flag

        # print(item['classname'] + " / " + ''.join(item['prof']) + " / " + item['classcode'])
        # print(option['note_stack'])
        # print(item['prof'])

def fill_item(driver, dept, pos, text, option):
    global item, item_height, page_lastitem
    section = switch_to_classname(pos[0])  # covert css location to string key
    height = int(pos[1])  # y 좌표 int 형으로 가지고 있어야 비교 가능

    if section in ('grade', 'classname', 'krcode'):
        # 페이지 넘어온 경우 prev 가 없으므로 print 못하고 그냥 item 덮어씌움

        if option['prev'] in ('time', 'note'):
            insert_to_DB(item_to_list(item, dept))
            item['prof'] = [] # init prof
            if option['note_init'] == True:
                item['note'] = []  # 노트를 비워줌
                item_height['note'] = ''  # note 위치도 초기화
                option['note_init'] = False

            item[section] = text
            option['prev'] = section
        else:
            # linear 하게 넣는 경우
            item[section] = text
            option['prev'] = section

    elif section == 'prof':

        if option['prev'] == 'prof':
            item['prof'].append(text)

        elif option['prev'] in ('time', 'note'):
            insert_to_DB(item_to_list(item, dept))
            item['prof'] =[]
            if option['note_init'] == True:
                item['note'] = []  # 노트를 비워줌
                item_height['note'] = ''  # note 위치도 초기화
                option['note_init'] = False

            item['prof'].append(text)
            option['prev'] = section

        else:
            # linear 하게 넣는 경우
            item['prof'].append(text)
            option['prev'] = section

    elif section == 'classcode':

        if text == page_lastitem['classcode']:
            # 이전 페이지의 마지막 item과 현재 item의 class code가 같은 경우
            # append_on 켜주고 시간에서 append
            item_height = init_height()  # new page can't compare to old page height
            option['append_on'] = '2'
            option['prev'] = section

        elif page_lastitem['classcode'] != "" and page_lastitem['classcode'] != text:
            # 처음 page last item이 비어있는 상태가 아닌 차 있을 때
            # 마지막 code, 현재 code가 다른 경우
            # 마지막 item 은 그대로 출력해주고 현재 item은 그대로 저장해나가면 됨.
            insert_to_DB(item_to_list(page_lastitem, dept))

            if option['note_init'] == True:
                item['note'] = []  # 노트를 비워줌
                option['note_init'] = False

            page_lastitem = create_item()  # init
            item_height = init_height()  # init
            item[section] = text
            option['prev'] = section

        elif option['prev'] in ('time', 'note'):
            # 한 교수가 한 과목에서 두개 이상의 강좌 할 경우
            # 이미 크롤러가 note에 대한 정보를 item에 담고 있음
            insert_to_DB(item_to_list(item, dept))
            if option['note_init'] == True:
                item['note'] = []  # 노트를 비워줌
                item_height['note'] = ''  # note 위치도 초기화
                option['note_init'] = False

            item[section] = text
            option['prev'] = section

        else:
            item[section] = text
            option['prev'] = section

    elif section == 'limit':
        item_height['limit'] = height
        # 같은 item 으로 처리하고 시간만 추가해줘야 함. append_on 을 켜서 time 저장할 때 같은 item으로 저장하게함
        if option['prev'] in ('time', 'note'):
            compare_stack(height, option)
            option['append_on'] = '1'
            option['prev'] = section

        else:
            # linear 하게 넣는 경우
            compare_stack(height, option)
            item[section] = text
            option['prev'] = section

    elif section == 'time':
        if option['append_on'] == '1':
            # 같은 item 내에서 시간을 추가하는 경우
            item['time'].append(text)
            option['append_on'] = '0'
            option['prev'] = section
        elif option['append_on'] == '2':
            # 이전 item에 append 시켜주자!
            # note 는 time처럼 append 시키면안되므로 비워줌
            page_lastitem['time'].append(text)
            item = page_lastitem
            item['note'] = []
            option['append_on'] = '0'
            page_lastitem = create_item()  # 초기화 해야 elif section == 'classcode' 에서 오류 안남
            option['prev'] = section
        else:
            # 비어있는 item['time'] 에 시간을 넣는 경우
            item['time'] = []  # 이전에 담긴 time을 지워주고!
            item['time'].append(text)  # append
            option['prev'] = section

    elif section == 'note':
        # 'note' 섹션은 같은 note끼리라도 크롤러에서 한번 지나가는걸 명심하자 헷갈리기 쉽다. 그 경우에 대한 분기다.

        if option['prev'] == 'note':
            # note가 두 줄 이상인 경우
            item['note'].append(text)

            tmp = item_height['note']
            item_height['note'] = (height + int(tmp)) / 2.0  # 비고가 두줄일 떄 중간값으로! 아직 3줄 이상인경우는 생각안했다.

            if abs(round(float(item_height['note'])) - int(item_height['limit'])) <= 5:
                # 한 개의 limit 과 두줄짜리 note 인 경우
                # 중간값과 classcode의 높이가 정확하게 일치하지 않는 경우가 있어서 이렇게. (1~2픽셀정도 차이난다.)
                # 이 경우 limit에 일치하는 note가 하나이므로, stack 삭제 후 그냥 pass!
                # 혹시몰라서 절댓값 abs() 를 이용했다
                # float을 통해 str -> float으로 해주고
                # round는 item_height가 소숫점 값이니까 반올림 시켜서 정수로 만들어주기 위해 했음
                option['note_stack'] -= 1
                option['note_init'] = True

        else:
            # 노트 첫번째 줄 진입
            item_height['note'] = height  # item에 위치 저장

            if abs(round(float(item_height['note'])) - int(item_height['limit'])) <= 2:
                # 한 개의 limit 과 한줄짜리 note 일 경우
                # 이런 경우에도 px가 안맞고 1~2 차이나는 경우가 있어서 이렇게 해줌..
                option['note_init'] = True
            else:  # 한 개의 limit 과 두줄 짜리 note 인 경우 or limit이 여러개 있어 note와 높이 차이가 나는 경우
                option['note_stack'] += 1

            item['note'].append(text)
            option['prev'] = section

            # 한줄짜리 note 도 한개 인 경우 출력 후 note 비워주어야 함

            # 이렇게 note에서 item_height 를 구성해두고 이제 classcode에서 매번 item_height['note'] 와 비교해서
            # stack I/O 하는것이 목적

    else:
        item[section] = text
        option['prev'] = section

def check_empty(driver):
    try:
        # 비어있는 페이지일 경우 viewer 안에 빈 페이지임을 알려주는 inneralert 이 생성됨
        inneralert = driver.find_element_by_xpath("//div[@class='aButtons']/button")
    except NoSuchElementException as e:
        # print(str(e))
        print("정상적인 페이지 입니다. 크롤링 하러 고고")
        return
    else:
        inneralert.click()
        print("비어있는 페이지 입니다.")
        return 'EXIT'

# Crawl Timetable
def crawl_timetable(driver, send_year, semester, dept):
    # Set table
    print("{} / {} / {} ".format(send_year, semester, switch_to_deptname(dept)))
    # year = driver.find_element_by_name("year")
    # year.send_keys(send_year)
    Select(driver.find_element_by_name("smt")).select_by_value(semester)
    Select(driver.find_element_by_name("dept_cd")).select_by_value(dept)

    # Search!
    driver.execute_script("thisPage1()")
    WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((By.ID, 'progress_mask')))
    # progress mask 는 로딩중일떄만 생성되는 element 이게 사라지는 순간까지 wait

    # 없는 페이지인지 확인
    if 'EXIT' == check_empty(driver):
        return

    # Find end page
    resize_page(driver)
    find_end = driver.find_element_by_class_name("crownix-pagenum")
    endpage = int(find_end.text.split(" ")[2])
    # Crawling!start
    for i in range(endpage):

        # 특정 page만 디버깅 해볼 경우
        # if i in (11,12,13):
        #     crawling_page(driver, dept)
        # else:
        #     next_page = driver.find_element_by_xpath('//li[@id="crownix-toolbar-next"]/a')
        #     next_page.click()

        if i == endpage - 1:
            crawling_page(driver, dept, True) # set end page option
        else:
            crawling_page(driver, dept)
            # Go to the next page
            next_page = driver.find_element_by_xpath('//li[@id="crownix-toolbar-next"]/a')
            next_page.click()

# logout
def logout(driver):
    driver.get("https://myiweb.mju.ac.kr")
    accept_alert(driver)

    # logout javascript function located in "Top" frame
    driver.switch_to.frame("Top")
    driver.execute_script("logOut()")
    time.sleep(2)
    return driver.quit()

if __name__ == "__main__":
    st = time.time()
    # set driver (headless mode)
    options = webdriver.ChromeOptions()
    options.binary_location='/usr/bin/google-chrome-unstable'
    options.add_argument('headless')
    options.add_argument('window-size=1200x600')
    driver = webdriver.Chrome(chrome_options=options)
    driver.get("http://myiweb.mju.ac.kr")

    # login(driver)
    driver.execute_script('document.getElementById("userID").value=""')
    driver.execute_script('document.getElementById("userPW").value=""')
    driver.execute_script('CheckSubmit()')
    # accept_alert(driver)
    print('success login')
    driver.implicitly_wait(10)
    # move to timetable
    driver.get("https://myiweb.mju.ac.kr/servlet/MyLocationPage?link=/su/sue/sue01/w_sue337pr.jsp")

    deptlist = ['10000', '20000', '12000', '16600', '11910', '11915', '11920',
                '11940', '11960', '12250', '12361', '12371', '12450', '12500',
                '12701', '12755', '12901', '12900', '12908', '12913', '13725',
                '13730', '13735', '13750', '13781', '13793', '13794', '18012',
                '18013', '18014', '18016', '14120', '14130', '14140', '14150',
                '16445', '16450', '14190', '14200', '14210', '14212', '16450',
                '14240', '14250', '16610', '16410', '16420', '16425', '16440',
                '16640', '16650', '16660', '16810', '18510', '18520']

    for i in deptlist:
        crawl_timetable(driver,"2017","10",i)

    # for test
    # crawl_timetable(driver,"2017","10","12913")

    print(" Crawling completed. ")
    logout(driver)
    print("running time : {}".format(time.time() - st))
