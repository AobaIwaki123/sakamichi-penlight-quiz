```sh
$ kubectl create namespace penlight
```

## GCRからPullするためのSecretを作成

- ArgoCD用

```sh
$ kubectl create secret docker-registry gcr-pull-secret \
  --docker-server=gcr.io \
  --docker-username=_json_key \
  --docker-password="$(cat path/to/your-service-account-key.json)" \
  --docker-email=unused@example.com \
  --namespace=penlight
```

## GCPのServce AccountのSecretを作成 

- アプリケーションが利用するBigQuery用

```sh
kubectl create secret generic gcp-sa-key \
  --from-file=key.json=path/to/your-service-account-key.json -n penlight
```
