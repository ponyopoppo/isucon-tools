# isucon-tools

## チェックリスト
### 色々測定
- ネットワークの帯域 (iperf)
- CPU, メモリ (htop)
- エンドポイント (nginx-log-parser)
### てきとう
- DBを把握する
- indexを貼る
- スロークエリを消す
- Redisを使う
- シャーディング
- 静的ファイル (nginx)


## iperf
ネットワークの帯域を測定する


接続先で実行
```
sudo apt-get install iperf
iperf -s
```

接続元で実行
```
sudo apt-get install iperf
iperf -c <host name>
```