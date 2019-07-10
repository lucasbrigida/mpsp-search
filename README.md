#### MPSP - BUSCADOR DE DADOS

### Requerimentos

Node (v10.16.0)

### Instalação

Se você já possui o node >= v10.16.x, proceda com o(s) comando(s) abaixo:

```sh
git clone
cd mpsp-search
npm ci
```

Se você não possui node instalado. ([Baixar Node >= v10.16.0](https://nodejs.org/en/download/))

### Como usar

Para buscar empresas por: **nome**, **razão social** ou **cnpj**.

1. Busca

    ```sh
    npm start -s nomeXPTO
    ```

2. Informe o captcha, quando solicitado
3. Os dados serão exibidos na tela e salvo em out.json
