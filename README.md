![License: MIT](https://img.shields.io/badge/License-MIT-green)
![GitHub package.json version](https://img.shields.io/github/package-json/v/denisix/binance-markets-streamer)
![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/denisix/binance-markets-streamer)

# binance-markets-streamer
Binance markets real-time trades data streamer to database (for later strategy backtesting)

### About
Binance provides a lot of documentations and APIs to fetch their market data, even websocket streams to fetch real-time trades for your analytics.
We can use such streams to make real-time trades history to back-test our ideas, strategies, bots.

### Get started

* clone the project
```
git clone https://github.com/denisix/binance-markets-streamer

```
* install deps and start
```sh
npm i
npm run start
```

also you can start the project using docker:
* please install [docker](https://docs.docker.com/engine/install/) & [docker compose V2](https://docs.docker.com/compose/install/)
* and start:
```sh
npm run docker
```
* you can see the logs like this:
```sh
npm run logs
```

#### Example data structure, MySQL table header:
| Variable | Description |
| --------------- | --------------- |
| t | unixtime with msec precision |
| s | market symbol |
| c | trade ID on the market |
| p | price |
| q | quantity |
| m | was the buyer the maker? |
| b | buyer order ID |
| a | seller order ID |

#### Example MySQL select:
```sql
mysql> select * from ticks limit 10;
+---------------+------------+----------+-----------+---------+------+------------+------------+
| t             | s          | c        | p         | q       | m    | b          | a          |
+---------------+------------+----------+-----------+---------+------+------------+------------+
| 1657989939004 | JUVBTC     |  2781598 | 0.0001828 |   37.17 |    1 |   69727058 |   69727617 |
| 1657989939004 | JUVBTC     |  2781599 | 0.0001828 |    7.79 |    1 |   69727083 |   69727617 |
| 1657989939004 | JUVBTC     |  2781600 | 0.0001828 |   10.05 |    1 |   69727093 |   69727617 |
| 1657989939004 | JUVBTC     |  2781601 | 0.0001828 |   18.79 |    1 |   69727109 |   69727617 |
| 1657989939004 | JUVBTC     |  2781602 | 0.0001828 |    3.28 |    1 |   69727170 |   69727617 |
| 1657989939019 | ERNBUSD    |  2700119 |     2.448 |    20.4 |    0 |   34814531 |   34814493 |
| 1657989939043 | ZECBTC     | 25423230 |  0.002966 |    0.15 |    1 |  473139829 |  473147389 |
| 1657989939043 | ZECBTC     | 25423231 |  0.002966 |    0.44 |    1 |  473139835 |  473147389 |
| 1657989939091 | BTCUSDC    | 49066761 |  21274.42 | 0.01465 |    0 | 1274142186 | 1274142057 |
| 1657989939093 | BURGERBUSD |  7777434 |     1.964 |    77.6 |    0 |   62991941 |   62650609 |
+---------------+------------+----------+-----------+---------+------+------------+------------+
10 rows in set (0,00 sec)
```
