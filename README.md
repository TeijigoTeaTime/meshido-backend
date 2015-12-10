# meshido-backend

## API Reference

### ログイン [POST /login]

* header

|key|value|
|:--|:----|
|Content-Type|application/json|
|X-Meshido-ApiVerion|1.0|


* parameters

```
{
	"name": "String",
	"email": "String",
	"group": "String"
}
```

※グループIDは事前にサーバー側で発行し、ユーザーは何かしらの方法で知っている前提

* response

```
[
  {
    "v": "0.1",
    "token": "token12345", // ユーザーを一意に特定するためのトークン
    "user": {
    	"name": "Taro Yamada",
    	"email": "foo@example.com",
    }
    "_links": {
        "self" : { 
        	"method": "GET",
        	"href": "/me",
        	"headers": {
				"Content-Type": "application/json",
				"X-Meshido-ApiVerion": "1.0",
				"X-Meshido-UsrToken" : "token12345"
        	},
        	"parameters" : ""
        }
    },
    "_embeded": "",
  }
]
```

### カレンダー [GET /group/{group}/calendar]

現在月の予定一覧を取得する。


* header

|key|value|
|:--|:----|
|Content-Type|Application/json|
|X-Meshido-ApiVerion|1.0|
|X-Meshido-UserToken|[/login]で取得したtoken|

* parameters

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
    "v": "0.1",
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
				        	"headers": {
								"Content-Type": "application/json",
								"X-Meshido-ApiVerion": "1.0",
								"X-Meshido-UsrToken" : "token12345"
				        	},
                            "parameters": {
                                "group": "group12345",
                                "year": 2015,
                                "month": 12,
                                "day": 1,
                                "eventType": "lunch"
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
				        	"headers": {
								"Content-Type": "application/json",
								"X-Meshido-ApiVerion": "1.0",
								"X-Meshido-UsrToken" : "token12345"
				        	},
                            "parameters": {
                                "group": "group12345",
                                "year": 2015,
                                "month": 12,
                                "day": 1,
                                "eventType": "dinner"
                            }
                        },
                    }
                }
            }
        },
        :
        : // 一ヶ月分
        :
    },
    "_links": {
        "self" : { 
        	"method": "GET",
        	"href": "/group/group12345/calendar/year/2015/month/12",
        	"headers": {
				"Content-Type": "application/json",
				"X-Meshido-ApiVerion": "1.0",
				"X-Meshido-UsrToken" : "token12345"
        	}
    	},
        "next" : { 
        	"method": "GET",
        	"href": "/group/group12345/calendar/year/2016/month/1",
        	"headers": {
				"Content-Type": "application/json",
				"X-Meshido-ApiVerion": "1.0",
				"X-Meshido-UsrToken" : "token12345"
        	}
    	},
        "prev" : { 
        	"method": "GET",
        	"href": "/group/group12345/calendar/year/2015/month/11",
        	"headers": {
				"Content-Type": "application/json",
				"X-Meshido-ApiVerion": "1.0",
				"X-Meshido-UsrToken" : "token12345"
        	}
    	},
    },
    "_embeded": "",
  }
]
```

### 参加 [POST /join]


* header

|key|value|
|:--|:----|
|Content-Type|Application/json|
|X-Meshido-ApiVerion|1.0|
|X-Meshido-UserToken|[/login]で取得したtoken|

* parameters

```
{
	"group":"String",
	"year":"Number",
	"month":"Number",
	"day":"Number",
	"eventType":"String[lunch/dinner]"
}

```

* response

```
[
  {
    "v": "0.1",
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
			        	"headers": {
							"Content-Type": "application/json",
							"X-Meshido-ApiVerion": "1.0",
							"X-Meshido-UsrToken" : "token12345"
			        	},
	                    "parameters": {
	                        "group": "group12345",
	                        "year": 2015,
	                        "month": 12,
	                        "day": 1,
	                        "eventType": "lunch"
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
			        	"headers": {
							"Content-Type": "application/json",
							"X-Meshido-ApiVerion": "1.0",
							"X-Meshido-UsrToken" : "token12345"
			        	},
	                    "parameters": {
	                        "group": "group12345",
	                        "year": 2015,
	                        "month": 12,
	                        "day": 1,
	                        "eventType": "dinner"
	                    }
	                },
	            }
	        }
	    }
    },
    "_links": "",
    "_embeded": "",
  }
]
```

### ユーザー情報 [GET /me]

* header

|key|value|
|:--|:----|
|Content-Type|Application/json|
|X-Meshido-ApiVerion|1.0|
|X-Meshido-UserToken|[/login]で取得したtoken|

* parameters

no parameters needed.

* response

```
[
  {
    "v": "0.1",
    "user" : {
    	"name": "Taro Yamada",
    	"email": "hogehoge@example.com",
    },
    "_links": {
    	"method": "GET",
    	"href": "/me",
    	"headers": {
			"Content-Type": "application/json",
			"X-Meshido-ApiVerion": "1.0",
			"X-Meshido-UsrToken" : "token12345"
    	},
    	"parameters" : ""
    },
    "_embeded": ""
  }
]
```
