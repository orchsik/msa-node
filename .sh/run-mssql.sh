#!/bin/bash

# 현재 스크립트의 경로를 가져온다.
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
SCRIPT_DIR="$SCRIPT_DIR/mssql"
# echo $SCRIPT_DIR

# 상위 디렉토리의 경로를 가져온다.
PROJECT_DIR=$(cd "$(dirname "$0")"/.. && pwd)
PROJECT_DIR="$PROJECT_DIR/mssql"
# echo $PROJECT_DIR

## host project 경로 사용
sudo docker run \
    -e 'ACCEPT_EULA=Y' \
    -e 'SA_PASSWORD=A!123456' \
    -e MSSQL_LCID=1042 \
    -e 'MSSQL_COLLATION=Korean_Wansung_CS_AS' \
    -e MSSQL_DATA_DIR='/var/opt/mssql/data' \
    -e MSSQL_BACKUP_DIR='/var/opt/mssql/backup' \
    -e MSSQL_LOG_DIR='/var/opt/mssql/log' \
    -e 'TZ=Asia/Seoul' \
    -d \
    -v $PROJECT_DIR/data:/var/opt/mssql/data -v $PROJECT_DIR/log:/var/opt/mssql/log -v $PROJECT_DIR/secrets:/var/opt/mssql/secrets \
    -p 1401:1433 \
    --name sql1 \
    --hostname sql1 \
    mcr.microsoft.com/mssql/server:2019-latest


## docker volume 사용
# sudo docker run \
#     -e 'ACCEPT_EULA=Y' \
#     -e 'SA_PASSWORD=A!123456' \
#     -e MSSQL_LCID=1042 \
#     -e 'MSSQL_COLLATION=Korean_Wansung_CS_AS' \
#     -e MSSQL_DATA_DIR='/var/opt/mssql/data' \
#     -e MSSQL_BACKUP_DIR='/var/opt/mssql/backup' \
#     -e MSSQL_LOG_DIR='/var/opt/mssql/log' \
#     -e 'TZ=Asia/Seoul' \
#     -d \
#     -v sqlvolume:/var/opt/mssql \
#     -p 1401:1433 \
#     --name sql1 \
#     --hostname sql1 \
#     mcr.microsoft.com/mssql/server:2019-latest

 