#!/bin/bash
hadoop  fs -get  /user/apparkart/org42 /home/apparkart/dataFromHadoop
cd /home/apparkart/dataFromHadoop/org42/;
cat */* > ../input.txt;
node machineLearningDailyJob.js;