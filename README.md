# meshido-backend

## API Reference

### ログイン [POST /login]

parameters

|parameter|value|
|:--------|:----|
|v|バージョン|
|name|ユーザー名|
|email|メールアドレス|
|group|グループID|

※グループIDは事前にサーバー側で発行し、ユーザーは何かしらの方法で知っている前提

```
[
  {
    "version": "0.1",
    "token": "token12345", // ユーザーを一意に特定するためのトークン
    "user": {
    	"name": "Taro Yamada",
    	"email": "foo@example.com",
    }
    "_links": {
        "self" : { "method": "GET", href": "/me/v/0.1/token/token12345" },
        "calendar" : { "method": "GET", "href": "/calender/v/0.1/group/group12345" },
        "logout" : { "method": "GET", "href": "/logout/v/0.1/token/token12345" },
    },
    "_embeded": "",
  }
]
```

### カレンダー [GET /calender/v/{version}/group/{group}]

現在月の予定一覧を取得する。

optional

|parameter|value|
|:--------|:----|
|year|取得対象の年|
|month|取得対象の月|
|day|取得対象の日|

dayまで指定すると、その日だけ取ってくる。

```
[
  {
    "version": "0.1",
    // 一ヶ月分のカレンダーと各イベントの状態
    "days": {
        {
            "dayOfMonth": 1,    // 日にち
            "weekday": "SUN",   // 曜日
            "events" {
                "lunch" : {
                    "hasJoined" : "true",   // 参加済みか
                    "isFixed" : "true",     // 確定済みのイベントか
                    "participantCount" : "3",  // 参加者数
                    "_links" {
                        "join" :  {
                            "method": "POST",
                            "href": "/join",
                            "parameters": {
                                "v": 0.1,
                                "group": "group12345",
                                "year": 2015,
                                "month": 12,
                                "day": 1,
                                "eventType": "lunch",
                                "token": "token12345"
                            }
                        },
                    }
                }
                "dinner" : {
                    "hasJoined" : "false",
                    "isFixed" : "true",
                    "participantCount" : "5",
                    "_links" {
                        "join" :  {
                            "method": "POST",
                            "href": "/join",
                            "parameters": {
                                "v": 0.1,
                                "group": "group12345",
                                "year": 2015,
                                "month": 12,
                                "day": 1,
                                "eventType": "dinner",
                                "token": "token12345"
                            }
                        },
                    }
                }
            }
        },
        {
            "dayOfMonth": 2,
            "weekday": "MON",
            "events" {
                "lunch" : {
                    "hasJoined" : "false",
                    "isFixed" : "true",
                    "participantCount" : "3",
                    "_links" {
                        "join" :  {
                            "method": "POST",
                            "href": "/join",
                            "parameters": {
                                "v": 0.1,
                                "group": "group12345",
                                "year": 2015,
                                "month": 12,
                                "day": 2,
                                "eventType": "lunch",
                                "token": "token12345"
                            }
                        },
                    }
                }
                "dinner" : {
                    "hasJoined" : "false",
                    "isFixed" : "true",
                    "participantCount" : "5",
                    "_links" {
                        "join" :  {
                            "method": "POST",
                            "href": "/join",
                            "parameters": {
                                "v": 0.1,
                                "group": "group12345",
                                "year": 2015,
                                "month": 12,
                                "day": 2,
                                "eventType": "dinner",
                                "token": "token12345"
                            }
                        },
                    }
                }
            }
        }
        :
        : // 一ヶ月分
        :
    },
    "_links": {
        "self" : { "method": "GET", "href": "/calender/v/0.1/group/group12345/year/2015/month/12" },
        "next" : { "method": "GET", "href": "/calender/v/0.1/group/group12345/year/2016/month/1" },
        "prev" : { "method": "GET", "href": "/calender/v/0.1/group/group12345/year/2015/month/11" },
        "logout" : { "method": "GET", "href": "/logout/v/0.1/token/token12345" },
        "me" : { ""method": "GET", href": "/me/v/0.1/token/token12345" },
    },
    "_embeded": "",
  }
]
```

### 参加 [POST /join]

parameters

|parameter|value|
|:--------|:----|
|v|バージョン|
|group|グループID|
|year|参加対象年|
|month|参加対象月|
|day|参加対象日|
|eventType|イベントタイプ(lunch/dinner)|
|token|トークン|

```
[
  {
    "version": "0.1",
    "result" : "success",
    "days": {       // 参加指定日の登録後状態
    {
        "dayOfMonth": 1,    // 日にち
        "weekday": "SUN",   // 曜日
        "events" {
            "lunch" : {
                "hasJoined" : "true",   // 参加済みか
                "isFixed" : "true",     // 確定済みのイベントか
                "participantCount" : "3",  // 参加者数
                "_links" {
                    "join" :  {
                        "method": "POST",
                        "href": "/join",
                        "parameters": {
                            "v": 0.1,
                            "group": "group12345",
                            "year": 2015,
                            "month": 12,
                            "day": 1,
                            "eventType": "lunch",
                            "token": "token12345"
                        }
                    },
                }
            }
            "dinner" : {
                "hasJoined" : "false",
                "isFixed" : "true",
                "participantCount" : "5",
                "_links" {
                    "join" :  {
                        "method": "POST",
                        "href": "/join",
                        "parameters": {
                            "v": 0.1,
                            "group": "group12345",
                            "year": 2015,
                            "month": 12,
                            "day": 1,
                            "eventType": "dinner",
                            "token": "token12345"
                        }
                    },
                }
            }
        }
    },
    "_links": {
        "self": { "href": "/join/v/{verion}/year/{year}/month/{month}/day/{day}/token/{token}" },
        "calendar" : { "href": "/calender/v/0.1/" },
        "logout" : { "href": "/logout" },
        "me" : { "href": "/me/v/0.1/token/{token}" },
    },
    "_embeded": "",
  }
]
```

### ユーザー情報 [GET /me/v/{verion}/token/{token}]

```
[
  {
    "version": "0.1",
    "user" : {
    	"name": "Taro Yamada",
    	"email": "hogehoge@example.com",
    },
    "_links": {
        "self" : { "href": "/me/v/0.1/token/{token}" },
    },
    "_embeded": ""
  }
]
```
