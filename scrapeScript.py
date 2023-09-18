import json
import re
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta
from urllib.parse import quote_plus

import requests
from bs4 import BeautifulSoup
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager


def getMongoClient():
    uri = "mongodb+srv://dagulathiya30:" + \
        quote_plus("Darshan@45") + \
        "@scrape.8yqpmc0.mongodb.net/?retryWrites=true&w=majority"
    client = MongoClient(uri, server_api=ServerApi('1'))
    return client


def pressClear(driver):
    ac = ActionChains(driver)
    ac.send_keys(Keys.TAB * 3 + Keys.ENTER)
    ac.perform()
    ac = ActionChains(driver)
    ac.send_keys(Keys.TAB + Keys.ENTER)
    ac.perform()


def safeCheck(driver):

    if len(driver.window_handles) >= 2:
        for i in range(2, len(driver.window_handles)):
            driver.switch_to.window(driver.window_handles[i])
            driver.close()
    driver.switch_to.window(driver.window_handles[1])
    return


def clearBrowser(driver):
    driver.switch_to.window(driver.window_handles[0])
    driver.get("chrome://settings/?search=clear")
    pressClear(driver)
    driver.get("chrome://settings/?search=clear")
    pressClear(driver)

    driver.switch_to.window(driver.window_handles[1])


def getLinkHTML(driver, itemlink):

    clearBrowser(driver)
    safeCheck(driver)

    driver.execute_script("window.open('')")
    driver.switch_to.window(driver.window_handles[2])
    driver.get(itemlink)

    data = driver.page_source
    driver.close()
    driver.switch_to.window(driver.window_handles[1])
    return BeautifulSoup(data, 'html.parser')


def getProductPage(link):

    d = requests.get(link, headers={'User-Agent': 'Mozilla/5.0'})

    soup_res = BeautifulSoup(d.text, 'html.parser')
    scripts = soup_res.find_all('script')

    for script in scripts:
        if script.string == None:
            continue
        script = str(script)
        if script.startswith("<script>window.__myx = "):
            match_res = re.search("{.*}", script)
            jdata = script[match_res.start():match_res.end()]
            jdata = json.loads(jdata)

            return jdata
    return None


def scrapeMyntraNewID(driver, mid_base="/dresses?f=Brand%3A", brand_name="SASSAFRAS", category="DRESSES", updater=True):
    base_url = "https://www.myntra.com" + mid_base + brand_name + "&sort=new"

    driver.switch_to.window(driver.window_handles[1])
    driver.get(base_url)
    safeCheck(driver)

    curr_page_html = BeautifulSoup(driver.page_source, 'html.parser')

    nextPage = True
    mclient = getMongoClient()
    pid_mdp = mclient.get_database('Scrape').get_collection("BrandProductId")

    # Delete Older Entries
    if updater:
        del_pid = pid_mdp.find(
            {"site_name": "Myntra", "brand_name": brand_name, "category": category}, {"_id": 0, "pid": 1})
        del_pid = [row["pid"] for row in list(del_pid)]

    # Fetch remaining entries
    if not updater:
        prev_pid = pid_mdp.find(
            {"date": {"$gte": datetime.today() + timedelta(days=-33)}}, {"_id": 0, "pid": 1})
    else:
        prev_pid = pid_mdp.find({}, {"_id": 0, "pid": 1})

    hash_prev_id = dict()
    for row in prev_pid:
        hash_prev_id[row["pid"]] = True

    product_ids = []
    while nextPage:
        for elem in curr_page_html.find_all("li", {"class": "product-base"}):
            lnk = elem.find('a')['href']
            product_id = re.findall("[0-9]+\\/buy", lnk)[0][:-4]

            if hash_prev_id.get(product_id, False) and updater == False:
                if updater == False:
                    nextPage = False
                break
            product_ids.append([product_id, lnk])

        if not nextPage:
            break

        nextPage = False
        next_link = curr_page_html.find("li", {"class": "pagination-next"})
        if next_link:
            next_link = next_link.find('a')['href']
            nextPage = True

            curr_page_html = getLinkHTML(driver, next_link)

    ndata = []
    for pid, product_link in product_ids:
        if hash_prev_id.get(product_id, False) and updater == False:
            continue
        ndata.append({"site_name": "Myntra", "brand_name": brand_name,
                     "pid": pid, "date": datetime.today(), "category": category, "product_link": product_link})
    if updater:
        pid_mdp.delete_many({"pid": {"$in": del_pid}, "site_name": "Myntra",
                            "brand_name": brand_name, "category": category})
    if ndata:
        pid_mdp.insert_many(ndata)

    product_links = pid_mdp.find(
        {"date": {"$gte": datetime.today() + timedelta(days=-33)}, "site_name": "Myntra", "brand_name": brand_name, "category": category}, {"_id": 0, "product_link": 1, "pid": 1})
    data = [[row['pid'], row["product_link"]] for row in list(product_links)]
    mclient.close()
    return data


def scrapeMyntra(driver, mid_base="/dresses?f=Brand%3A", brand_name="SASSAFRAS", category="DRESSES"):
    base_url = "https://www.myntra.com/"

    # get all new ids and ids to delete
    prd_data = scrapeMyntraNewID(
        driver, mid_base=mid_base, brand_name=brand_name, category=category)
    # print("page_done")
    ##############################
    if not prd_data:
        return
    ##############################
    data = []
    for pid, plink in prd_data:
        try:

            pdpData = getProductPage(base_url + plink)

            if not pdpData:
                continue

            pdpData = pdpData['pdpData']
            sp = pdpData.get("price", {}).get("discounted", 0)
            mrp = pdpData.get("price", {}).get("mrp", 0)
            avg = pdpData.get("ratings", {}).get("averageRating", 0)
            cnt = pdpData.get("ratings", {}).get("totalCount", 0)
            size_row = dict()

            for row in pdpData.get('sizes', []):
                size_row[row['label']] = row['available']
            img_urls = []
            for row in pdpData.get('media', dict()).get('albums', []):
                if row["name"] == 'default':
                    for img in row["images"]:
                        img_urls.append(img["imageURL"])

            data.append({"pid": pid, "date": datetime.today(),
                        "avg_rating": avg, "user_count": cnt, "Sizes": size_row, "SP": sp, "mrp": mrp, "img_urls": img_urls})

        except Exception as e:
            print("An exception occurred", e)
            print("PID", plink)

            # PUt logs file here
    #########################
    mclient = getMongoClient()
    pid_mdp = mclient.get_database('Scrape').get_collection("PRD_RT_CNT")

    ###### ---- Delete Products ----- #########

    pid_mdp.insert_many(data)
    mclient.close()
    #########################
    return


def threadStarterMyntra(exe_pth="./chromedriver-mac-arm64/", mid_base="/dresses?f=Brand%3A", brand_name="SASSAFRAS", category="DRESSES"):

    options = webdriver.ChromeOptions()
    service = ChromeService()
    # driver = webdriver.Chrome(service=service, options=options)
    driver = webdriver.Chrome(service=ChromeService(
        ChromeDriverManager().install()))

    driver.get("chrome://settings/?search=clear")
    driver.execute_script("window.open('')")
    driver.switch_to.window(driver.window_handles[1])

    scrapeMyntra(driver, mid_base=mid_base,
                 brand_name=brand_name, category=category)

    driver.close()


def startScraper(exe_pth="E:\\Scrap\\chromedriver-win64\\"):
    ##########
    # Put your brands and prefix of links here
    # brands = ["SASSAFRAS", "Anouk", "Tokyo Talkies"]
    prefix_link_brand = {
        "DRESSES": {'url': "/dresses?f=Brand%3A", "brands": ["SASSAFRAS"]}

        ###
        # , "CategoryName" : {'url': 'url_prefix_here', 'brands' : ['brandname1','brandname2']}
        ###
    }
    ##########
    # mid_base = "/dresses?f=Brand%3A"
    scrape_params = []
    for category in prefix_link_brand:
        for brand in prefix_link_brand[category]["brands"]:
            # t1 = threading.Thread(target=threadStarterMyntra, args=(), kwargs={
            #    "exe_pth": exe_pth, "mid_base": prefix_link_brand[category]['url'], "brand_name": brand, "category": category})

            scrape_params.append(
                [exe_pth, prefix_link_brand[category]['url'], brand, category])

    with ThreadPoolExecutor(MAX_WORKERS) as executor:
        process = {executor.submit(threadStarterMyntra,
                                   exe_pth=exe_pth,
                                   mid_base=mid_base,
                                   brand_name=brand_name,
                                   category=category): process_num for process_num, (exe_pth, mid_base, brand_name, category) in enumerate(scrape_params)}

        for completed_task in as_completed(process):
            task_num = process[completed_task]
            try:
                completed_task.result()
                print("Completed Task:", scrape_params[task_num])
            except Exception as exp:
                print("Exception Occured while completing:",
                      scrape_params[task_num])
                print(exp)

    return

#################### Config Params ################
##################### ---------------------------------################################


MAX_WORKERS = 5

if __name__ == "__main__":
    startScraper(exe_pth="E:\\Scrap\\chromedriver-win64")
