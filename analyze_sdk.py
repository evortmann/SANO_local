from bs4 import BeautifulSoup
import re

html_path = '/home/ubuntu/browser_html/nutri-onco-62cefdf9_base44_app_page_1784029112696.html'
with open(html_path, 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

# Procurar por scripts que contenham "base44" ou "sdk"
scripts = soup.find_all('script')
for script in scripts:
    if script.get('src'):
        print(f"Script SRC: {script.get('src')}")
    else:
        content = script.string
        if content and ('base44' in content.lower() or 'sdk' in content.lower()):
            print(f"Inline Script contains Base44/SDK keywords")

# Procurar por chamadas de API ou configurações no código
# Frequentemente o SDK da Base44 é inicializado com um App ID
app_id_match = re.search(r'appId["\']?\s*:\s*["\']([^"\']+)["\']', str(soup))
if app_id_match:
    print(f"Found App ID: {app_id_match.group(1)}")
else:
    print("App ID not found in HTML")
