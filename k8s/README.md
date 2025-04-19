```sh
$ kubectl create namespace penlight
```

## HarborからPullするためのSecretを作成

```sh
$ kubectl create secret docker-registry harbor-pull-secret \
  --docker-server=harbor.aooba.net \
  --docker-username=robot$argocd \
  --docker-password=hoge \
  --docker-email=unused@example.com \
  --namespace=penlight
```

## GCPのServce AccountのSecretを作成

```sh
kubectl create secret generic gcp-sa-key \
  --from-file=key.json=path/to/your-service-account-key.json -n penlight
```
