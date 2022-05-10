FROM node:18-alpine

LABEL author="Nabil Redmann (BananaAcid) <repo@bananaacid.de>"
LABEL version="3.3.3"
LABEL description="Node File Manager Server \
    on NodeJS 18"

#ENV FM_DIRECTORY 
ENV FM_FILTER zip|tar.gz|7z|7zip|tar|gz|tgz|tbz|tar.bz2|tar.bz|txt|md|doc|docx|otf|ppt|pptx|xls|xlsx|csv|indd|jpg|jpeg|heic|heif|png|ps|svg|ai|avi|mp4|mpg|wav|flac|mpeg|mov
ENV FM_MIMEFILTER video/*|audio/*|image/*
ENV FM_SECURE ""
ENV FM_USER ""
ENV FM_MAXSIZE 300
ENV FM_LOGGING *
ENV FM_NAME ""


WORKDIR /usr/src/app

COPY . .


RUN mkdir "$(pwd)/data" && mkdir "$(pwd)/secure" 

RUN ln -sf "$(pwd)/data" /data
VOLUME /data

RUN cp "$(pwd)/bin/htpasswd" "$(pwd)/secure/htpasswd"
RUN ln -sf "$(pwd)/secure" /secure
VOLUME /secure


RUN npm install

RUN npm install pm2 -g 2>/dev/null 

RUN mkdir -p /root/.npm/_logs
RUN ln -sf /root/.npm/_logs /logs
VOLUME /logs


EXPOSE 5000
CMD pm2-runtime npm -- run start-if-docker