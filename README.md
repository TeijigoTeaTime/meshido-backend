# meshido-backend

## API Reference

### root [GET /]

```
[
  {
    "version": "0.1",
    "_links": {
        "self": { "href": "/" },
        "login": { "href": "/login/v/0.1/name/{name}/email/{email}/" },
        "calendar" : { "href": "/calender/v/0.1/" },
        "me" : { "href": "/me/v/0.1/token/{token}" },
    },
    "_embeded": "",
  }
]
```

### ログイン [GET /login/v/{verion}/name/{name}/email/{email}/]

```
[
  {
    "version": "0.1",
    "token": "ユーザーを一意に特定するためのトークン",
    "user": {
    	"name": "Taro Yamada",
    	"email": "foo@example.com",
    }
    "_links": {
        "self": { "href": "/login/v/0.1/name/{name}/email/{email}/" },
        "calendar" : { "href": "/calender/v/0.1/" },
        "logout" : { "href": "/logout" },
        "me" : { "href": "/me/v/0.1/token/{token}" },
    },
    "_embeded": "",
  }
]
```

### カレンダー [GET /login/v/{verion}]

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
    "_links": {
        "self" : { "href": "/calender/v/0.1/year/2015/month/12" },
        "next" : { "href": "/calender/v/0.1/year/2016/month/1" },
        "prev" : { "href": "/calender/v/0.1/year/2015/month/11" },
        "logout" : { "href": "/logout" },
        "me" : { "href": "/me/v/0.1/token/{token}" },
    },
    "_embeded": {
    	// 一ヶ月分のカレンダーと各イベントの状態
    	"days" {
    		"1":{
    			"doy": "SUN",
    			"events" {
    				"lunch" : {
    					"is_fixed" : "true"
    					"participant_count" : "3"
    					"_links" {
    						"join" :  { "href": "/join/v/0.1/year/2015/month/12/day/1/lunch" },
    					}
    				}
    				"dinner" : {
    					"is_fixed" : "true"
    					"participant_count" : "5"
    					"_links" {
    						"join" :  { "href": "/join/v/0.1/year/2015/month/12/day/1/dinner" },
    					}
    				}
    			}
    		},
    		"2":{
    			"doy": "MON",
    			"events" {
    				"lunch" : {
    					"is_fixed" : "false"
    					"participant_count" : "3"
    					"_links" {
    						"join" :  { "href": "/join/v/0.1/year/2015/month/12/day/2/lunch" },
    					}
    				}
    				"dinner" : {
    					"is_fixed" : "false"
    					"participant_count" : "5"
    					"_links" {
    						"join" :  { "href": "/join/v/0.1/year/2015/month/12/day/2/dinner" },
    					}
    				}
    			}
    		}
    		:
    		: // 一ヶ月分
    		:
    	}
    },
  }
]
```

### 参加 [GET /join/v/{verion}/year/{year}/month/{month}/day/{day}/token/{token}]

```
[
  {
    "version": "0.1",
    "result" : "success",
    "_links": {
        "self": { "href": "/join/v/{verion}/year/{year}/month/{month}/day/{day}/token/{token}" },
        "calendar" : { "href": "/calender/v/0.1/" },
        "logout" : { "href": "/logout" },
        "me" : { "href": "/me/v/0.1/token/{token}" },
    },
    "_embeded": {
    	// 参加指定日の登録後状態
    	"days" {
    		"1":{
    			"doy": "SUN",
    			"events" {
    				"lunch" : {
    					"is_fixed" : "true"
    					"participant_count" : "3"
    					"_links" {
    						"join" :  { "href": "/join/v/0.1/year/2015/month/12/day/1/lunch" },
    					}
    				}
    				"dinner" : {
    					"is_fixed" : "true"
    					"participant_count" : "5"
    					"_links" {
    						"join" :  { "href": "/join/v/0.1/year/2015/month/12/day/1/dinner" },
    					}
    				}
    			}
    		},
    	}
    }
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
