# printer-server

練習用的列印伺服器

## 專案設置
```
npm install
```

### 專案啟用於本機端
```
npm run serve
```

### 專案打包
```
npm run build
```

### 執行檔案
```
./server.js
```

### docker 指令
```
docker run -d --rm --name printer -p 9999:9999 pa013971/printer-server:latest
```