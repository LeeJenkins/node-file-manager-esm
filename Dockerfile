FROM node:17.1

LABEL autorhor="Nabil Redmann (BananaAcid) <repo@bananaacid.de>"
LABEL version="3.1.1"
LABEL description="Node File Manager Server \
    on NodeJS 17.1"

#ENV FM_DIRECTORY 
ENV FM_FILTER zip|tar.gz|7z|7zip|tar|gz|tgz|tbz|tar.bz2|tar.bz|txt|md|doc|docx|otf|ppt|pptx|xls|xlsx|csv|indd|jpg|jpeg|heic|heif|png|ps|svg|ai|avi|mp4|mpg|wav|flac|mpeg|mov
ENV FM_SECURE ""
ENV FM_LOGGING *


WORKDIR /usr/src/app


RUN ln -sf "$(pwd)/example" /data
VOLUME /data

COPY . .
RUN npm install

RUN npm install pm2 -g 2>/dev/null 

RUN mkdir /root/.npm/_logs
RUN ln -sf /root/.npm/_logs /logs
VOLUME /logs


EXPOSE 5000
CMD pm2-runtime npm -- run start-if-docker