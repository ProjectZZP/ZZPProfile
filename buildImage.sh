docker build -t maanenh/zzp-profile-srv .

# See:  https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
#docker login

docker push maanenh/zzp-profile-srv



# docker run -p 8080:8080 -d maanenh/zzp-profile-srv
# docker run -it maanenh/zzp-profile-srv sh