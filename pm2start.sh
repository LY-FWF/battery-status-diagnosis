#!/bin/bash

# 项目：battery-status-diagnosis
# 名称：高速磁浮蓄电池状态诊断模块

# PM2运行端口
PORT=10001

# PM2运行名称
NAME="$PORT:蓄电池状态诊断"

# PM2运行脚本
pm2 serve ./dist --port "$PORT" --spa --name "$NAME"
