# ベースイメージとして Python 3.10 を使用
FROM python:3.10

# 作業ディレクトリを設定
WORKDIR /app

# 必要なライブラリをインストール
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# ポートを開放
EXPOSE 8000
