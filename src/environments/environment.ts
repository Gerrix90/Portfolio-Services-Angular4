// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyAcVDCvLIjsLJtPURCJmDzqAzom7lh9CfI",
    authDomain: "angular4-adrienleteintur-c4e11.firebaseapp.com",
    databaseURL: "https://angular4-adrienleteintur-c4e11.firebaseio.com",
    projectId: "angular4-adrienleteintur-c4e11",
    storageBucket: "angular4-adrienleteintur-c4e11.appspot.com",
    messagingSenderId: "537650330182"
  },
  weatherApi: {
    apiKeys: '28de745d768ffc16e78ffdd0c98c0779'
  },
  newsApi: {
    apiKeys: '38ebc5051f664a78bbfa50c9d9ceb5c2'
  }
};
