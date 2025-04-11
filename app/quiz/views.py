import random
import requests
from bs4 import BeautifulSoup
from django.http import JsonResponse

def get_bukken(request):
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

        headers = {
            'User-Agent': 'Mozilla/5.0'
        }

        response = requests.get(base_url, headers=headers)
        response.encoding = response.apparent_encoding

        soup = BeautifulSoup(response.text, 'html.parser')
        bukken_list = soup.select('.cassetteitem')

        if not bukken_list:
            return JsonResponse({'error': '物件情報が見つかりませんでした。'}, status=400)

        selected = random.choice(bukken_list)

        # 建物情報
        data_home = {
            'address': selected.select_one('.cassetteitem_detail-col1').get_text(strip=True),
            'name': selected.select_one('.cassetteitem_content-title').get_text(strip=True),
            'station': selected.select_one('.cassetteitem_detail-col2').get_text(strip=True),
            'age': selected.select_one('.cassetteitem_detail-col3').get_text(strip=True),
        }

        # 部屋情報（最初の1つだけ使う）
        room_table = selected.select_one('.cassetteitem_other')
        first_row = room_table.select_one('tbody tr')
        td = first_row.select('td')

        room_floor = td[2].get_text(strip=True)
        rent = td[3].select_one('.cassetteitem_price--rent').get_text(strip=True)
        kanri = td[3].select_one('.cassetteitem_price--administration').get_text(strip=True)
        deposit = td[4].select_one('.cassetteitem_price--deposit').get_text(strip=True)
        gratuity = td[4].select_one('.cassetteitem_price--gratuity').get_text(strip=True)

        # 家賃・管理費を数値に変換
        if '万円' in rent:
            y = int(float(rent.replace('万円', '').replace('-', '0')) * 10000)
        else:
            return JsonResponse({'error': '家賃の形式が不正です'}, status=400)

        if kanri.endswith('円') and kanri.replace(',', '').replace('円', '').isdigit():
            z = int(gratuity.replace(',', '').replace('円', ''))
        else:
            return JsonResponse({'error': '管理費の形式が不正です'}, status=400)

        data_room = {
            'room_floor': room_floor,
            'rent': rent,
            'kanri': kanri,
            'deposit': deposit,
            'gratuity': gratuity,
            'layout': td[5].select_one('cassetteitem_madori').get_text(strip=True),
            'size': td[5].select_one('cassetteitem_menseki').get_text(strip=True),
            #'url': 'https://suumo.jp' + td[8].select_one('a')['href']
        }

        return JsonResponse({
            'data_home': data_home,
            'data_room': data_room,
            'answer': y + z
        })

    except Exception as e:
        return JsonResponse({'error': f'スクレイピングエラー: {str(e)}'}, status=500)

'''
from django.http import JsonResponse
import random

def get_bukken(request):
    # ダミーデータ
    data = {
        "data_home": {
            "name": "サンプルマンション",
            "address": "東京都新宿区○○",
            "station": "新宿駅 徒歩5分",
            "age": "築10年"
        },
        "data_room": {
            "floor": "3階",
            "rent": "10.5万円",
            "management_fee": "5,000円",
            "deposit": "1.0万円",
            "gratuity": "1.5万円",
            "layout": "1LDK",
            "size": "40㎡",
            "url": "https://suumo.jp/example"
        },
        "answer": 25000  # 敷金＋礼金
    }
    return JsonResponse(data)
from django.shortcuts import render

# Create your views here.
'''
