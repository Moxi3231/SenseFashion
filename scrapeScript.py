from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains

from bs4 import BeautifulSoup
import re

from datetime import timedelta, datetime

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

from urllib.parse import quote_plus

import threading


def getMongoClient():
    uri = "mongodb+srv://dagulathiya30:Darshan%4045@scrape.8yqpmc0.mongodb.net/"
    client = MongoClient(uri, server_api=ServerApi('1'))
    return client


def pressClear(driver):
    ac = ActionChains(driver)
    ac.send_keys(Keys.TAB * 3 + Keys.ENTER)
    ac.perform()
    ac = ActionChains(driver)
    ac.send_keys(Keys.TAB + Keys.ENTER)
    ac.perform()


def clearBrowser(driver):
    driver.execute_script("window.open('')")
    driver.switch_to.window(driver.window_handles[1])
    driver.get("chrome://settings/?search=clear")

    pressClear(driver)
    pressClear(driver)

    driver.close()
    driver.switch_to.window(driver.window_handles[0])


def getLinkHTML(driver, itemlink):

    clearBrowser(driver)

    driver.execute_script("window.open('')")
    driver.switch_to.window(driver.window_handles[1])
    driver.get(itemlink)

    data = driver.page_source
    driver.close()
    driver.switch_to.window(driver.window_handles[0])
    return BeautifulSoup(data, 'html.parser')


def scrapeMyntraNewID(driver, mid_base="/dresses?f=Brand%3A", brand_name="SASSAFRAS"):
    base_url = "https://www.myntra.com" + mid_base + brand_name + "&sort=new"

    driver.get(base_url)
    curr_page_html = BeautifulSoup(driver.page_source, 'html.parser')

    nextPage = True
    mclient = getMongoClient()
    pid_mdp = mclient.get_database('Scrape').get_collection("BrandProductId")

    # Delete Older Entries
    del_pid = pid_mdp.find(
        {"date": {"$lt": datetime.today() + timedelta(days=-33)}}, {"_id": 0, "pid": 1})
    del_pid = [row["pid"] for row in list(del_pid)]
    pid_mdp.delete_many({"pid": {"$in": del_pid}})
    # Fetch remaining entries
    prev_pid = pid_mdp.find({"site_name": "Myntra", "brand_name": brand_name})
    if not prev_pid:
        prev_pid = []
    else:
        prev_pid = [row["pid"] for row in prev_pid]

    product_ids = []
    while nextPage:
        for elem in curr_page_html.find_all("li", {"class": "product-base"}):
            lnk = elem.find('a')['href']
            product_id = re.findall("[0-9]+\\/buy", lnk)[0][:-4]
            if product_id in prev_pid:
                nextPage = False
                break
            product_ids.append(product_id)

        if not nextPage:
            break

        nextPage = False
        next_link = curr_page_html.find("li", {"class": "pagination-next"})
        if next_link:
            next_link = next_link.find('a')['href']
            nextPage = True

            curr_page_html = getLinkHTML(driver, next_link)

    ndata = []
    for pid in product_ids:
        ndata.append({"site_name": "Myntra", "brand_name": brand_name,
                     "pid": pid, "date": datetime.today()})
    if ndata:
        pid_mdp.insert_many(ndata)
    mclient.close()
    return product_ids + prev_pid, del_pid


def scrapeMyntra(driver, mid_base="/dresses?f=Brand%3A", brand_name="SASSAFRAS"):
    base_url = "https://www.myntra.com/"

    # get all new ids and ids to delete
    pids, del_pids = scrapeMyntraNewID(
        driver, mid_base=mid_base, brand_name=brand_name)
    # print("page_done")
    ##############################
    if not pids:
        return
    ##############################
    data = []
    for pid in pids:
        
        try:
            hpg = getLinkHTML(driver, base_url + str(pid))
            elem = hpg.find_all("div", {"id": "detailedRatingContainer"})
            if not elem:
                continue

            elem = elem[0]
            avg = elem.find_all(
                "div", {"class": "index-flexRow index-averageRating"})[0].find("span").text
            cnt = elem.find_all(
                "div", {"class": "index-countDesc"})[0].text.split(" ")[0]

            size_detail = hpg.find_all(
                "div", {"class": "size-buttons-size-buttons"})
            size_row = dict()

            if size_detail:
                size_detail = size_detail[0].find_all(
                    "div", {"class": "size-buttons-buttonContainer"})

                for btn in size_detail:
                    btn = btn.find_all("button")[0]
                    cls_btn = btn["class"][0].lower()
                    size_name = btn.find_all("p")[0].text

                    if "disabled" in cls_btn:
                        size_row[size_name] = "NA"
                    else:
                        size_row[size_name] = "AV"

            data.append({"pid": pid, "date": datetime.today(),
                        "avg_rating": avg, "user_count": cnt, "Sizes": size_row})
        except Exception as e:
            print("An exception occurred",e)
            print("PID",pid)

            ## PUt logs file here
    #########################
    mclient = getMongoClient()
    pid_mdp = mclient.get_database('Scrape').get_collection("PRD_RT_CNT")

    ###### ---- Delete Products ----- #########
    pid_mdp.delete_many({"pid": {"$in": del_pids}})

    pid_mdp.insert_many(data)
    mclient.close()
    #########################
    return


def threadStarterMyntra(exe_pth="./chromedriver-mac-arm64/", mid_base="/dresses?f=Brand%3A", brand_name="SASSAFRAS"):

    options = webdriver.ChromeOptions()
    service = ChromeService()
    driver = webdriver.Chrome(service=service, options=options)

    scrapeMyntra(driver, mid_base=mid_base, brand_name=brand_name)

    driver.close()


def startScraper(exe_pth="E:\\Scrap\\chromedriver-win64\\"):
    ##########
    # Put your brands here
    brands = ["SASSAFRAS", "Anouk","Tokyo Talkies"]

    ##########
    mid_base = "/dresses?f=Brand%3A"
    thrds = []
    for brd in brands:

        t1 = threading.Thread(target=threadStarterMyntra, args=(), kwargs={
                              "exe_pth": exe_pth, "mid_base": mid_base, "brand_name": brd})
        thrds.append(t1)

    for t in thrds:
        t.start()
    for t in thrds:
        t.join()
    return

if __name__ == "__main__":
    startScraper(exe_pth="E:\\Scrap\\chromedriver-win64")
