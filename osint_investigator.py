"""
=============================================================
  أداة الصحافة الاستقصائية - OSINT Investigator
  يستخدم APIs مجانية 100%
=============================================================
APIs المستخدمة:
  1. OpenCorporates API  - سجلات الشركات العالمية
  2. GDELT API           - أرشيف الأخبار العالمي
  3. Nominatim (OSM)     - بيانات جغرافية/عقارية
  4. Wikipedia API       - معلومات عامة
=============================================================
التثبيت: pip install requests colorama fuzzywuzzy python-Levenshtein pandas
=============================================================
"""

import requests
import json
import time
import sys
from datetime import datetime
from urllib.parse import quote

# ============================================================
# الألوان للطرفية
# ============================================================
try:
    from colorama import Fore, Style, init
    init(autoreset=True)
    RED    = Fore.RED
    GREEN  = Fore.GREEN
    YELLOW = Fore.YELLOW
    CYAN   = Fore.CYAN
    BOLD   = Style.BRIGHT
    RESET  = Style.RESET_ALL
except ImportError:
    RED = GREEN = YELLOW = CYAN = BOLD = RESET = ""

def print_header():
    print(f"""
{CYAN}{BOLD}
╔══════════════════════════════════════════════════════╗
║       أداة الصحافة الاستقصائية - OSINT Tool         ║
║       APIs مجانية | بيانات حقيقية                   ║
╚══════════════════════════════════════════════════════╝
{RESET}""")

def print_section(title):
    print(f"\n{YELLOW}{BOLD}{'='*55}")
    print(f"  {title}")
    print(f"{'='*55}{RESET}")

def print_result(label, value, confidence=""):
    conf_color = GREEN if confidence == "High" else YELLOW if confidence == "Medium" else ""
    print(f"  {CYAN}▶{RESET} {label}: {BOLD}{value}{RESET}", end="")
    if confidence:
        print(f"  [{conf_color}{confidence}{RESET}]", end="")
    print()


# ============================================================
# 1. OpenCorporates - سجلات الشركات
# ============================================================
class CorporateSearcher:
    BASE_URL = "https://api.opencorporates.com/v0.4"
    
    def search_person_companies(self, name: str) -> list:
        """البحث عن الشركات المرتبطة بشخص"""
        results = []
        try:
            url = f"{self.BASE_URL}/officers/search"
            params = {"q": name, "per_page": 10}
            r = requests.get(url, params=params, timeout=10)
            if r.status_code == 200:
                data = r.json()
                officers = data.get("results", {}).get("officers", [])
                for o in officers:
                    officer = o.get("officer", {})
                    company = officer.get("company", {})
                    results.append({
                        "person": officer.get("name", ""),
                        "position": officer.get("position", "غير محدد"),
                        "company_name": company.get("name", ""),
                        "company_number": company.get("company_number", ""),
                        "jurisdiction": company.get("jurisdiction_code", ""),
                        "status": company.get("current_status", ""),
                        "source_url": company.get("opencorporates_url", "")
                    })
        except Exception as e:
            print(f"  {RED}خطأ OpenCorporates: {e}{RESET}")
        return results

    def search_company(self, company_name: str) -> list:
        """البحث المباشر عن شركة"""
        results = []
        try:
            url = f"{self.BASE_URL}/companies/search"
            params = {"q": company_name, "per_page": 5}
            r = requests.get(url, params=params, timeout=10)
            if r.status_code == 200:
                data = r.json()
                companies = data.get("results", {}).get("companies", [])
                for c in companies:
                    company = c.get("company", {})
                    results.append({
                        "name": company.get("name", ""),
                        "number": company.get("company_number", ""),
                        "jurisdiction": company.get("jurisdiction_code", ""),
                        "status": company.get("current_status", ""),
                        "incorporation_date": company.get("incorporation_date", ""),
                        "url": company.get("opencorporates_url", "")
                    })
        except Exception as e:
            print(f"  {RED}خطأ بحث الشركة: {e}{RESET}")
        return results

    def find_shared_companies(self, name1: str, name2: str) -> list:
        """إيجاد الشركات المشتركة بين شخصين"""
        companies1 = {r["company_name"] for r in self.search_person_companies(name1)}
        time.sleep(1)  # احترام rate limit
        companies2 = {r["company_name"] for r in self.search_person_companies(name2)}
        shared = companies1.intersection(companies2)
        return list(shared)


# ============================================================
# 2. GDELT - أرشيف الأخبار
# ============================================================
class NewsSearcher:
    GDELT_API = "https://api.gdeltproject.org/api/v2/doc/doc"
    
    def search_person(self, name: str, days_back: int = 365) -> list:
        """البحث عن شخص في الأخبار"""
        results = []
        try:
            params = {
                "query": f'"{name}"',
                "mode": "artlist",
                "maxrecords": 15,
                "format": "json",
                "timespan": f"{days_back}d",
                "sort": "DateDesc"
            }
            r = requests.get(self.GDELT_API, params=params, timeout=15)
            if r.status_code == 200:
                data = r.json()
                articles = data.get("articles", [])
                for a in articles:
                    results.append({
                        "title": a.get("title", ""),
                        "url": a.get("url", ""),
                        "date": a.get("seendate", ""),
                        "source": a.get("domain", ""),
                        "language": a.get("language", "")
                    })
        except Exception as e:
            print(f"  {RED}خطأ GDELT: {e}{RESET}")
        return results

    def search_two_persons(self, name1: str, name2: str) -> list:
        """البحث عن ذكر شخصين معاً"""
        results = []
        try:
            params = {
                "query": f'"{name1}" "{name2}"',
                "mode": "artlist",
                "maxrecords": 10,
                "format": "json",
                "timespan": "730d",
                "sort": "DateDesc"
            }
            r = requests.get(self.GDELT_API, params=params, timeout=15)
            if r.status_code == 200:
                data = r.json()
                results = data.get("articles", [])
        except Exception as e:
            print(f"  {RED}خطأ GDELT مزدوج: {e}{RESET}")
        return results

    def get_tone_analysis(self, name: str) -> dict:
        """تحليل النبرة الإعلامية حول شخص"""
        try:
            params = {
                "query": f'"{name}"',
                "mode": "tonechart",
                "format": "json",
                "timespan": "365d"
            }
            r = requests.get(self.GDELT_API, params=params, timeout=15)
            if r.status_code == 200:
                return r.json()
        except:
            pass
        return {}


# ============================================================
# 3. Nominatim (OpenStreetMap) - بيانات جغرافية
# ============================================================
class LocationSearcher:
    NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
    HEADERS = {"User-Agent": "InvestigativeJournalismTool/1.0"}
    
    def search_location(self, query: str) -> list:
        """البحث عن موقع جغرافي"""
        results = []
        try:
            params = {
                "q": query,
                "format": "json",
                "limit": 5,
                "addressdetails": 1
            }
            r = requests.get(self.NOMINATIM_URL, params=params,
                           headers=self.HEADERS, timeout=10)
            if r.status_code == 200:
                data = r.json()
                for item in data:
                    address = item.get("address", {})
                    results.append({
                        "display_name": item.get("display_name", ""),
                        "type": item.get("type", ""),
                        "lat": item.get("lat", ""),
                        "lon": item.get("lon", ""),
                        "city": address.get("city", address.get("town", "")),
                        "country": address.get("country", ""),
                        "osm_url": f"https://www.openstreetmap.org/{item.get('osm_type','')}/{item.get('osm_id','')}"
                    })
        except Exception as e:
            print(f"  {RED}خطأ Nominatim: {e}{RESET}")
        return results

    def find_shared_locations(self, locations1: list, locations2: list) -> list:
        """إيجاد المناطق الجغرافية المشتركة"""
        set1 = {loc.lower() for loc in locations1}
        set2 = {loc.lower() for loc in locations2}
        return list(set1.intersection(set2))


# ============================================================
# 4. Wikipedia API - معلومات عامة
# ============================================================
class WikiSearcher:
    API_URL = "https://en.wikipedia.org/w/api.php"
    
    def search(self, name: str) -> dict:
        """البحث في ويكيبيديا"""
        try:
            params = {
                "action": "query",
                "list": "search",
                "srsearch": name,
                "format": "json",
                "srlimit": 3
            }
            r = requests.get(self.API_URL, params=params, timeout=10)
            if r.status_code == 200:
                data = r.json()
                results = data.get("query", {}).get("search", [])
                if results:
                    top = results[0]
                    # جلب مقتطف الصفحة
                    page_params = {
                        "action": "query",
                        "prop": "extracts",
                        "exintro": True,
                        "explaintext": True,
                        "titles": top["title"],
                        "format": "json"
                    }
                    pr = requests.get(self.API_URL, params=page_params, timeout=10)
                    if pr.status_code == 200:
                        pages = pr.json().get("query", {}).get("pages", {})
                        for page_id, page in pages.items():
                            extract = page.get("extract", "")
                            return {
                                "title": page.get("title", ""),
                                "summary": extract[:500] + "..." if len(extract) > 500 else extract,
                                "url": f"https://en.wikipedia.org/wiki/{quote(page.get('title',''))}"
                            }
        except Exception as e:
            print(f"  {RED}خطأ Wikipedia: {e}{RESET}")
        return {}


# ============================================================
# المحرك الرئيسي للتحقيق
# ============================================================
class InvestigativeTool:
    
    def __init__(self):
        self.corporate = CorporateSearcher()
        self.news      = NewsSearcher()
        self.location  = LocationSearcher()
        self.wiki      = WikiSearcher()
        self.findings  = []

    def investigate_person(self, name: str, known_locations: list = None):
        """تحقيق شامل في شخص واحد"""
        print_section(f"تحقيق في: {name}")
        known_locations = known_locations or []

        # Wikipedia
        print(f"\n{BOLD}[ويكيبيديا]{RESET}")
        wiki_data = self.wiki.search(name)
        if wiki_data:
            print_result("العنوان", wiki_data["title"])
            print(f"  {wiki_data['summary'][:300]}...")
            print(f"  رابط: {wiki_data['url']}")
        else:
            print("  لم يُعثر على معلومات في ويكيبيديا")

        # سجلات الشركات
        print(f"\n{BOLD}[سجلات الشركات - OpenCorporates]{RESET}")
        companies = self.corporate.search_person_companies(name)
        if companies:
            for c in companies[:5]:
                print_result(
                    f"{c['company_name']} ({c['jurisdiction']})",
                    f"المنصب: {c['position']} | الحالة: {c['status']}",
                    "High"
                )
                if c['source_url']:
                    print(f"    → {c['source_url']}")
        else:
            print("  لا توجد سجلات شركات")

        # الأخبار
        print(f"\n{BOLD}[أرشيف الأخبار - GDELT]{RESET}")
        articles = self.news.search_person(name, days_back=365)
        if articles:
            for a in articles[:5]:
                print(f"  📰 {a['date'][:8]} | {a['source']}")
                print(f"     {a['title'][:100]}")
                print(f"     {a['url']}")
        else:
            print("  لا توجد أخبار حديثة")

        # المواقع الجغرافية
        if known_locations:
            print(f"\n{BOLD}[التحقق الجغرافي - OpenStreetMap]{RESET}")
            for loc in known_locations:
                geo = self.location.search_location(f"{name} {loc}")
                if geo:
                    print_result(loc, geo[0]['display_name'])
                time.sleep(1)

        return {
            "name": name,
            "wiki": wiki_data,
            "companies": companies,
            "news": articles
        }

    def find_connections(self, person1: dict, person2: dict):
        """إيجاد الروابط بين شخصين"""
        name1 = person1["name"]
        name2 = person2["name"]
        
        print_section(f"روابط: {name1}  ↔  {name2}")
        connections = []

        # شركات مشتركة
        print(f"\n{BOLD}[الشركات المشتركة]{RESET}")
        shared = self.corporate.find_shared_companies(name1, name2)
        if shared:
            for company in shared:
                print_result("شركة مشتركة", company, "High")
                connections.append({"type": "shared_company", "value": company, "confidence": "High"})
        else:
            print("  لا توجد شركات مشتركة مباشرة")

        time.sleep(1)

        # ذكر مشترك في الأخبار
        print(f"\n{BOLD}[الذكر المشترك في الأخبار]{RESET}")
        joint_articles = self.news.search_two_persons(name1, name2)
        if joint_articles:
            for a in joint_articles[:5]:
                print(f"  📰 {a.get('seendate','')[:8]} | {a.get('domain','')}")
                print(f"     {a.get('title','')[:100]}")
                print(f"     {a.get('url','')}")
                connections.append({
                    "type": "news_co_mention",
                    "value": a.get('title',''),
                    "source": a.get('url',''),
                    "confidence": "Medium"
                })
        else:
            print("  لا يوجد ذكر مشترك في الأخبار")

        # مواقع مشتركة
        locs1 = person1.get("known_locations", [])
        locs2 = person2.get("known_locations", [])
        if locs1 and locs2:
            print(f"\n{BOLD}[المواقع الجغرافية المشتركة]{RESET}")
            shared_locs = self.location.find_shared_locations(locs1, locs2)
            if shared_locs:
                for loc in shared_locs:
                    print_result("موقع مشترك", loc, "Medium")
                    connections.append({"type": "shared_location", "value": loc, "confidence": "Medium"})
            else:
                print("  لا توجد مواقع مشتركة")

        return connections

    def save_report(self, data: dict, filename: str = None):
        """حفظ التقرير كـ JSON"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"report_{timestamp}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\n{GREEN}✓ تم حفظ التقرير: {filename}{RESET}")
        return filename


# ============================================================
# واجهة سطر الأوامر
# ============================================================
def main():
    print_header()
    
    print("اختر وضع التشغيل:")
    print("  1. تحقيق في شخص واحد")
    print("  2. إيجاد روابط بين شخصين")
    print("  3. البحث في سجلات شركة")
    
    choice = input(f"\n{BOLD}اختر (1/2/3): {RESET}").strip()
    
    tool = InvestigativeTool()
    report = {}

    if choice == "1":
        name = input("اسم الشخص: ").strip()
        locations_input = input("المواقع المعروفة (افصل بفاصلة، أو اتركها فارغة): ").strip()
        locations = [l.strip() for l in locations_input.split(",")] if locations_input else []
        
        person = {"name": name, "known_locations": locations}
        report = tool.investigate_person(name, locations)
        report["query_type"] = "single_person"

    elif choice == "2":
        print("\n--- الشخص الأول ---")
        name1 = input("الاسم: ").strip()
        locs1_input = input("المواقع المعروفة (افصل بفاصلة): ").strip()
        locs1 = [l.strip() for l in locs1_input.split(",")] if locs1_input else []

        print("\n--- الشخص الثاني ---")
        name2 = input("الاسم: ").strip()
        locs2_input = input("المواقع المعروفة (افصل بفاصلة): ").strip()
        locs2 = [l.strip() for l in locs2_input.split(",")] if locs2_input else []

        person1 = {"name": name1, "known_locations": locs1}
        person2 = {"name": name2, "known_locations": locs2}

        data1 = tool.investigate_person(name1, locs1)
        time.sleep(2)
        data2 = tool.investigate_person(name2, locs2)
        time.sleep(2)
        connections = tool.find_connections(person1, person2)

        report = {
            "query_type": "connection_search",
            "person1": data1,
            "person2": data2,
            "connections": connections
        }

    elif choice == "3":
        company_name = input("اسم الشركة: ").strip()
        print_section(f"بحث عن شركة: {company_name}")
        results = tool.corporate.search_company(company_name)
        if results:
            for c in results:
                print(f"\n  {BOLD}{c['name']}{RESET}")
                print(f"  الرقم: {c['number']} | النطاق: {c['jurisdiction']}")
                print(f"  الحالة: {c['status']} | تأسست: {c['incorporation_date']}")
                print(f"  الرابط: {c['url']}")
        else:
            print("  لا توجد نتائج")
        report = {"query_type": "company_search", "results": results}

    else:
        print(f"{RED}اختيار غير صحيح{RESET}")
        sys.exit(1)

    # حفظ التقرير
    save = input(f"\n{BOLD}هل تريد حفظ التقرير؟ (y/n): {RESET}").strip().lower()
    if save == "y":
        tool.save_report(report)

    print(f"\n{GREEN}{BOLD}✓ انتهى التحقيق.{RESET}")


if __name__ == "__main__":
    main()
