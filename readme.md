## Profile Service


#### Get All Profiles

```
http://\<host\>/api/profile
```
returns an array with all profileId's

#### Get All Profiles for 'entity-2'
```
http://\<host\>/api/profile?entityId=entity-2
```
returns an array with profile objects that belong to `entity-2`

#### Get the details for profile-3
```
http://\<host\>/api/profile/profile-3
```
returns one profile object