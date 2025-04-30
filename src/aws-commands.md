
## private key .pem is crated in aws console and stored in the folder aws-deployment folder
## connect to the AWS EC2 instance ...
ssh -i "C:\projects\squizMe\aws-deployment\squizme-ec2-mumbai.pem" ubuntu@ec2-65-2-71-250.ap-south-1.compute.amazonaws.com


## redis
Redis will start automatically, but it won't restart at boot time. To do this, run:

sudo snap set redis service.start=true
You an use these additional snap-related commands to start, stop, restart, and check the status of Redis:

sudo snap start redis
sudo snap stop redis
sudo snap restart redis
sudo snap services redis
If your Linux distribution does not currently have Snap installed, you can install it using the instructions described here. Then, consult the Snapcraft store for instructions on installing Redis using Snap for your distribution.

Starting and stopping Redis in the background
You can start the Redis server as a background process using the systemctl command. This only applies to Ubuntu/Debian when installed using apt, and Red Hat/Rocky when installed using yum.

sudo systemctl start redis
To stop the server, use:

sudo systemctl stop redis

## Redis cli to check whether its running.
redis-cli ping 
## will return pong if successfully running.

## install net tools for ipconfig ifconfig
sudo apt install net-tools


## nodejs installation on aws ubuntu...
sudo apt install nodejs

## node -v
v18.19.1

## install npm
sudo apt install npm

## install process mangager like pm2 to run app in background.
sudo npm install pm2 -g

## copy file to aws instnace - you need to create the .ppk files in  your local, from .pem file using puttygen.

C:\> pscp -i "C:\projects\squizMe\aws-deployment\aws-squizme-instance.ppk" backend.server.js ubuntu@ec2-65-2-71-250.ap-south-1.compute.amazonaws.com:/home/ubuntu/



