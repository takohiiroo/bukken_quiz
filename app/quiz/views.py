import random
import requests
from bs4 import BeautifulSoup
from django.http import JsonResponse
import urllib
import re

def get_bukken(request):
    #最大10回までリトライ
    for attempt in range(50):
        try:
            # 1〜2000ページのランダムなページ番号
            page_num = random.randint(1, 2000)
    
            base_url = (
                "https://suumo.jp/jj/chintai/ichiran/FR301FC001/"
                "?ar=030&bs=040&ta=13"
                "&sc=13101&sc=13102&sc=13103&sc=13104&sc=13105&sc=13113"
                "&sc=13106&sc=13107&sc=13108&sc=13118&sc=13121&sc=13122"
                "&sc=13123&sc=13109&sc=13110&sc=13111&sc=13112&sc=13114"
                "&sc=13115&sc=13120&sc=13116&sc=13117&sc=13119"
                "&sc=13201&sc=13202&sc=13203&sc=13204&sc=13205"
                "&sc=13206&sc=13207&sc=13208&sc=13209&sc=13210"
                "&sc=13211&sc=13212&sc=13213&sc=13214&sc=13215"
                "&sc=13218&sc=13219&sc=13220&sc=13221&sc=13222"
                "&sc=13223&sc=13224&sc=13225&sc=13227&sc=13228"
                "&sc=13229&sc=13300&cb=0.0&ct=9999999&mb=0"
                "&mt=9999999&et=9999999&cn=9999999"
                "&shkr1=03&shkr2=03&shkr3=03&shkr4=03"
                "&sngz=&po1=09&pc=50"
                f"&page={page_num}"
            )

            abs_url = "https://suumo.jp/chintai/"
    
            headers = {
                'User-Agent': 'Mozilla/5.0'
            }
    
            response = requests.get(base_url, headers=headers)
            response.encoding = response.apparent_encoding
    
            soup = BeautifulSoup(response.text, 'html.parser')
            bukken_list = soup.select('.cassetteitem')

            bc_url_list = soup.select('.js-cassette_link_href')
            bc_url = random.choice(bc_url_list).get('href')
    
            shosai_url = urllib.parse.urljoin(abs_url, bc_url) 

            if not bukken_list:
                return JsonResponse({'error': '情報を取得できませんでした。'}, status=400)
                continue
            
            if not shosai_url:
                return JsonResponse({'error': '情報を取得できませんでした。'}, status=400)
                continue 
            page_response = requests.get(shosai_url, headers=headers)
            page_response.encoding = page_response.apparent_encoding
            
            selected = BeautifulSoup(page_response.text, 'html.parser')

            td = selected.select('.property_view_table td')
            yachin_kanri = selected.select('.property_view_note-info span')
            bukken_gaiyou = selected.select('.table_gaiyou td')

            # 建物情報
            data_home = {
                'address': td[0].get_text(strip=True),
                'name': selected.select_one('.section_h1-header-title').get_text(strip=True),
                'station': td[1].get_text(strip=True),
                'age': td[4].get_text(strip=True),
                'kozo': bukken_gaiyou[1].get_text(strip=True),
                'energy': bukken_gaiyou[4].get_text(strip=True),
                'dannetsu': bukken_gaiyou[5].get_text(strip=True),
                'meyasukonetsuhi': selected.select('.table_gaiyou ul')[3].get_text(strip=True),
                'sonpo': bukken_gaiyou[7].get_text(strip=True),
                'parking': bukken_gaiyou[8].get_text(strip=True),
                'nyukyo': bukken_gaiyou[9].get_text(strip=True),
                'torihikikeitai': bukken_gaiyou[10].get_text(strip=True),
                'joken': bukken_gaiyou[11].get_text(strip=True),
                'sokosu': bukken_gaiyou[14].get_text(strip=True),
                'hoshogaisha': selected.select('.table_gaiyou tr')[9].select_one('ul').get_text(strip=True),
                'shokihiyo': selected.select('.table_gaiyou tr')[10].select_one('ul').get_text(strip=True),
            }

            rent = selected.select_one('.property_view_note-emphasis').get_text(strip=True)
            kanri = yachin_kanri[1].get_text(strip=True)
            # 家賃・管理費を数値に変換
            if '万円' in rent:
                y = int(float(rent.replace('万円', '').replace('-', '0')) * 10000)
            else:
                return JsonResponse({'error': '家賃の形式が不正です'}, status=400)
                continue

            if kanri.endswith('-'):
                z = 0  # "-" の場合は0円扱い
            elif kanri.endswith('円'):
                cleaned = re.findall(r'\d+', kanri.replace(',', ''))
                if len(cleaned) == 1:
                    z = int(cleaned[0])  # 数値の場合（例: "5,000円" → 5000）
                else:
                    return JsonResponse({'error': '管理費の数値が不正です'}, status=400)
                    continue
            else:
                return JsonResponse({'error': '管理費の形式が不正です（"円"を含む必要があります）'}, status=400)
                continue

            # まずimgタグたちを取得
            img_url_tags = selected.select('#js-view_gallery-list img')
            # data-srcをリストにまとめる
            src_list = [img_url_tags.get('data-src') for img_url_tags in img_url_tags if img_url_tags.get('data-src')]
            # リストをカンマ区切りの文字列にする
            img_urls = ",".join(src_list)

            #リンク作成
            data_room = {
                'room_floor': bukken_gaiyou[2].get_text(strip=True),
                'rent': rent,
                'kanri': kanri,
                'layout': td[2].get_text(strip=True),
                'size': td[3].get_text(strip=True),
                'url': shosai_url,
                'img_urls': img_urls,
                'muki': td[6].get_text(strip=True),
                'tokucho': selected.select_one('#bkdt-option li').get_text(strip=True),
                'madori': bukken_gaiyou[0].get_text(strip=True),
                'shikikin': yachin_kanri[2].get_text(strip=True),
                'reikin': yachin_kanri[3].get_text(strip=True),
                'hoshokin': yachin_kanri[4].get_text(strip=True),
                'shikibiki': yachin_kanri[5].get_text(strip=True),
            }
    
            return JsonResponse({
                'data_home': data_home,
                'data_room': data_room,
                'answer': y + z
            })
    
        except Exception:
            if attempt == 49:  # 最終試行で失敗
                return JsonResponse(
                    {'error': 'データ取得に失敗しました。しばらく待って再試行してください。'},
                    status=500
                )
            continue  # エラー発生時は次の試行へ

    # 理論上ここに到達しない（forループ内でreturnされるため）
    return JsonResponse({'error': '予期せぬエラー'}, status=500)
