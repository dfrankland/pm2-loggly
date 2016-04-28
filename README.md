# pm2-loggly
[PM2](https://www.npmjs.com/package/pm2/) Remote Logging to [Loggly](https://www.loggly.com/)

[![NPM](https://nodei.co/npm/pm2-loggly.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/pm2-loggly/)

### Installation

`pm2 install pm2-loggly`

### Configuration
##### Default Configuration
You can see this inside of [`package.json`](https://github.com/dfrankland/pm2-loggly/blob/master/package.json).
```json
"config": {
  "logglyClient": {
    "token": "your-token",
    "subdomain": "your-subdomain",
    "tags": "your-tag-1,your-tag-2"
  },
  "pm2Apps": "your-app-1,your-app-2"
}
```

##### Explanation of Configuration Options
* `logglyClient.token`: a token from `https://your-subdomain.loggly.com/tokens`
* `logglyClient.subdomain`: your Loggly subdomain
* `logglyClient.tags`: a comma-delimited list of global tags applied to all logs
* `pm2Apps`: a comma-delimited list of apps allowed to log to Loggly (logs will be tagged with the app name as well)

##### Recommended Way of Setting the Configuration Options
In your terminal run each of these commands:
``` bash
pm2 set pm2-loggly.logglyClient.token my-extra-long-token-from-loggly
pm2 set pm2-loggly.logglyClient.subdomain mylogglysubdomain
pm2 set pm2-loggly.logglyClient.tags tag1,tag2,tag3
pm2 set pm2-loggly.pm2Apps app1,app2,app3
```

##### Optional Way of Setting the Configuration Options
1. Edit `~/.pm2/module_conf.json` and add something like this inside the first `{}`:

  ```json
  "pm2-loggly": {
    "logglyClient": {
      "token": "my-extra-long-token-from-loggly",
      "subdomain": "mylogglysubdomain",
      "tags": "tag1,tag2,tag3"
    },
    "pm2Apps": "app1,app2,app3"
  }
  ```
2. Edit `pm2-loggly/package.json` and replace the default configuration above with:

  ```json
  "config": {
    "logglyClient": {
      "token": "my-extra-long-token-from-loggly",
      "subdomain": "mylogglysubdomain",
      "tags": "tag1,tag2,tag3"
    },
    "pm2Apps": "app1,app2,app3"
  }
  ```
