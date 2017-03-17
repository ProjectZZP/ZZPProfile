## Profile Service


#### Get All Profiles

```
http://<host>/api/profile
```
returns an array with all profileId's

#### Get All Profiles for 'entity-2'
```
http://<host>/api/profile?entityId=entity-2
```
returns an array with profile objects that belong to `entity-2`

#### Get the details for profile-3
```
http://<host>/api/profile/profile-3
```
returns one profile object

#### Post new data

```
http://<host>/api/profile
```
 Do a post with to this URL with Content-Type=`application/json`
 
 Example of object to post:
``` 
  {
    "profileId": "profile-2",
    "entityId": "entity-1",
    "title": "Software architect",
    "description": "For all you design issues",
    "tags": [ "tag-1", "tag-2", "tag-3" ]
  }
```   
It will add or replace a profile. 
