# Minhas Tarefas — Android com alarme

Aplicativo de lista de tarefas feito com HTML, CSS e JavaScript, empacotado para Android com Capacitor. Cada tarefa pode ter data e hora e gera uma notificação local agendada pelo Android, que pode ser entregue mesmo quando a interface do app não está aberta.

## Recursos

- Criar tarefa com data e hora
- Marcar como concluída
- Remover tarefa
- Salvar tarefas no LocalStorage
- Agendar/cancelar notificações locais no Android
- Layout responsivo e tema escuro

## Requisitos no computador

- Node.js instalado
- Android Studio instalado
- JDK compatível com a versão do Android Studio/Capacitor

## 1. Instalar dependências

Abra o terminal dentro da pasta do projeto:

```bash
npm install
```

## 2. Criar o projeto Android

Execute uma única vez:

```bash
npx cap add android
```

Depois sincronize:

```bash
npx cap sync android
```

## 3. Abrir no Android Studio

```bash
npx cap open android
```

Espere o Gradle terminar a sincronização.

## 4. Gerar APK

No Android Studio, use:

`Build > Build App Bundle(s) / APK(s) > Build APK(s)`

Para distribuição, gere um APK/AAB assinado em:

`Build > Generate Signed App Bundle or APK`

## Sobre o alarme com o app fechado

O app usa notificações locais agendadas pelo sistema Android. Isso é diferente de um `setInterval()` no navegador: o horário é entregue ao Android no momento em que a tarefa é criada.

O Android pode exigir permissão para notificações. Dependendo da versão do Android e das políticas de economia de bateria do fabricante, alarmes extremamente exatos podem sofrer ajustes. Para um despertador de alta prioridade que toque continuamente até ser desligado, é necessário implementar uma camada Android nativa com AlarmManager/serviço apropriado.

## Som personalizado

O JavaScript está configurado para `beep.wav`. Depois de executar `npx cap add android`, coloque um arquivo de som compatível em um recurso Android apropriado e ajuste o nome se necessário. Se nenhum som personalizado válido estiver disponível, configure a notificação para usar o som padrão do dispositivo.

## Atualizações no HTML/CSS/JS

Sempre que alterar arquivos dentro de `www/`, execute:

```bash
npx cap sync android
```

Depois execute novamente pelo Android Studio.

## Gerar APK pela internet com GitHub Actions (sem Android SDK no PC)

Este projeto inclui o workflow `.github/workflows/build-android.yml`.

1. Crie um repositório no GitHub e envie todos os arquivos deste projeto, incluindo a pasta `.github`.
2. Abra a aba **Actions** do repositório.
3. Selecione **Build Android APK**.
4. Clique em **Run workflow** e confirme em **Run workflow**.
5. Aguarde a compilação terminar com o indicador verde.
6. Abra a execução concluída e procure a seção **Artifacts**.
7. Baixe **lista-tarefas-android-apk**.
8. Extraia o arquivo baixado. Dentro dele estará `app-debug.apk`, que pode ser transferido e instalado no Android para testes.

O APK gerado por esse workflow é uma versão **debug**, apropriada para testes e instalação direta. Para publicação na Google Play, é necessário gerar uma versão release assinada.
