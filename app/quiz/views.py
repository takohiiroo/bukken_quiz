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
