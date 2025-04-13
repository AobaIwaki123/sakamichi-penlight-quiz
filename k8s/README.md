```sh
$ kubectl create namespace penlight
```

```sh
$ kubectl create secret docker-registry harbor-pull-secret \
  --docker-server=harbor.aooba.net \
  --docker-username=robot$argocd \
  --docker-password=hoge \
  --docker-email=unused@example.com \
  --namespace=penlight
```
