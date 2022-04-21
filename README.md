# Auth-backend-API

## endpoints
Function | endpoint | Fields required
---------|----------| ---------------
register | /v1/register | email, password
login | /v1/login | email, password
token | /v1/token | refreshToken
update | /v1/update | accessToken, ?fieldsToUpdate
info | /v1/info | accessToken
logout | /v1/logout | accessToken
delete | /v1/delete | accessToken
