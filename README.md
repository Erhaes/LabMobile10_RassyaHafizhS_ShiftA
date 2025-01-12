# Login Menggunakan Firebase

Nama : Rassya Hafizh Suharjo

NIM : H1D022068

SHIFT : A(Baru) D(Lama)

## Router
Berdasarkan router pada aplikasi ini, halaman home yang ditampilkan secara default merupakan halaman /login. Namun, halaman utama juga bisa berganti langsung ke /home jika variabel isAuth nya true. Jika false, maka akan diarahkan ke halaman login. Profile Page dapat diakses setelah masuk ke halaman home atau harus sudah login dengan isAuth true.

```ts
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: {
      isAuth: false,
    },
  },
  {
    path: '/home',
    name: 'home',
    component: HomePage,
    meta: {
      isAuth: true,
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage,
    meta: {
      isAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
```

```ts
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (authStore.user === null) {
    await new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, () => {
        resolve();
        unsubscribe();
      });
    });
  }

  if (to.path === '/login' && authStore.isAuth) {
    next('/home');
  } else if (to.meta.isAuth && !authStore.isAuth) {
    next('/login');
  } else {
    next();
  }
});
```

## Koneksi Firebase
Koneksi firebase terdapat di 'firebas.ts'. Pada 'firebase.ts' dilakukan inisialisasi koneksi ke firebase pada aplikasi dengan konfigurasi sesuai database dari akun firebase yang ingin dihubungkan.
```ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
const firebaseConfig = {
  apiKey: "AIzaSyCSAAM1QUpD6erFSDTpa9s-s5s_8njIc2c",
  authDomain: "vue-firebase-cff27.firebaseapp.com",
  projectId: "vue-firebase-cff27",
  storageBucket: "vue-firebase-cff27.firebasestorage.app",
  messagingSenderId: "117211972129",
  appId: "1:117211972129:web:bfd63a27dfcb2ad5575960"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
```

## Halaman Login
Pada halaman 'LoginPage.ts' terdapat title dan button untuk melakukan login ke google melalui firebase authentication.
```html
<div id="container">
                <!-- Title -->
                <ion-text style="margin-bottom: 20px; text-align: center;">
                    <h1>Praktikum Pemrograman Mobile</h1>
                </ion-text>

                <!-- Button Sign In -->
                <ion-button @click="login" color="light">
                    <ion-icon slot="start" :icon="logoGoogle"></ion-icon>
                    <ion-label>Sign In with Google</ion-label>
                </ion-button>
            </div>
```

Terdapat variabel asynchronous yang menunggu user untuk mengklik button login untuk memanggil fungsi LoginWithGoogle() dari 'auth.ts' untuk dijalankan dengan useAuthStore yaitu store dari pinia.
```ts
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();

const login = async () => {
    await authStore.loginWithGoogle();
};
```

Pada halaman 'auth.ts' dilakukan penyimpanan data user ke firebase authentication. Jika data user berhasil tersimpan ke firebase, maka di firebase console pada tabel user di firebase authentication akan terisi email google yang tersambung ke pengguna. User.value kemudian tidak null sehingga isAuth menjadi true dan user akan diarahkan ke halaman home. Terdapat juga alert apabila login gagal dilakukan.
```ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import router from '@/router';
import { auth } from '@/utils/firebase';
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut, User } from 'firebase/auth';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { alertController } from '@ionic/vue';
export const useAuthStore = defineStore('auth', () => {
    // Variabel User
    const user = ref<User | null>(null);

    // Sign In with Google
    const loginWithGoogle = async () => {
        try {
            await GoogleAuth.initialize({
                clientId: '117211972129-d19fcuq0ievvtpfkbf3buqtmh6jodu2f.apps.googleusercontent.com',
                scopes: ['profile', 'email'],
                grantOfflineAccess: true,
            });

            const googleUser = await GoogleAuth.signIn();

            const idToken = googleUser.authentication.idToken;

            const credential = GoogleAuthProvider.credential(idToken);

            const result = await signInWithCredential(auth, credential);

            user.value = result.user;

            router.push("/home");
        } catch (error) {
            console.error("Google sign-in error:", error);
            
            const alert = await alertController.create({
                header: 'Login Gagal!',
                message: 'Terjadi kesalahan saat login dengan Google. Coba lagi.',
                buttons: ['OK'],
            });

            await alert.present();

            throw error;
        }
    };
```

Penjelasan cara login :
```ts
const googleUser = await GoogleAuth.signIn();
```
Memanggil metode signIn() dari library Capacitor Google Auth untuk memulai proses login menggunakan akun Google.

```ts
const idToken = googleUser.authentication.idToken;
```
Mengambil ID Token dari data autentikasi yang disediakan oleh Google. ID Token adalah token berbasis JWT yang dihasilkan oleh Google setelah autentikasi berhasil. Token ini digunakan untuk mengidentifikasi pengguna secara unik dalam aplikasi.

```ts
const credential = GoogleAuthProvider.credential(idToken);
```
Membuat credential Firebase dari ID Token menggunakan metode GoogleAuthProvider.credential. Credential digunakan oleh Firebase Authentication untuk memvalidasi pengguna terhadap backend Firebase memungkinkan aplikasi untuk mengenali pengguna yang masuk sebagai pengguna yang valid di Firebase.

```ts
const result = await signInWithCredential(auth, credential);
```
Menggunakan credential untuk masuk ke Firebase Authentication melalui metode signInWithCredential.

```ts
user.value = result.user;
```
Menyimpan informasi pengguna yang berhasil login ke dalam variabel user.

Kemudian ketika user.value sudah terisi maka variabel isAuth menjadi true
```ts
const isAuth = computed(() => user.value !== null);
```

![Page Login](gambar/login1.png)
![Login Google](gambar/login2edit.jpg)



## Halaman Home
![Halaman Home](gambar/home.png)

Halaman dapat diakses ketika variabel isAuth dalam keadaan true. Umumnya terjadi setelah melakukan login atau ketika membuka kembali aplikasi sebelum logout. Pada halaman home terdapat dua tab menu yang diambil dari 'TabsMenu.vue'. Terdapat home dan profile yang mengarahkan ke halaman Profile.
HomePage.vue
```html
<ion-content :fullscreen="true">
      <div>
      </div>
      <TabsMenu />
    </ion-content>
<script setup lang="ts">
import TabsMenu from '@/components/TabsMenu.vue';
</script>
```

TabsMenu.vue
```html
<ion-tabs>
        <ion-router-outlet></ion-router-outlet>

        <ion-tab-bar slot="bottom">
            <ion-tab-button tab="home" href="/home" layout="icon-top">
                <ion-icon :icon="home"></ion-icon>
                <ion-label>Home</ion-label>
            </ion-tab-button>

            <ion-tab-button tab="profile" href="/profile" layout="icon-top">
                <ion-icon :icon="person"></ion-icon>
                <ion-label>Profile</ion-label>
            </ion-tab-button>
        </ion-tab-bar>
    </ion-tabs>
```


## Halaman Profile

![Halaman Profil](gambar/profiledit.jpg)

Pada halaman profile menampilkan foto profil, nama akun, dan alamat email dari akun google yang terhubung.
```html
<div id="avatar-container">
    <ion-avatar>
        <img alt="Avatar" :src="userPhoto" @error="handleImageError" />
    </ion-avatar>
</div>

<!-- Data Profile -->
<ion-list>
    <ion-item>
        <ion-input label="Nama" :value="user?.displayName" :readonly="true"></ion-input>
    </ion-item>

    <ion-item>
        <ion-input label="Email" :value="user?.email" :readonly="true"></ion-input>
    </ion-item>
</ion-list>
```

Pada halaman tersebut juga mengimport dari halaman auth.ts untuk variabel isAuth karena perlu true untuk dapat mengakses halaman ini atau harus sudah login sehingga user.value sudah terisi supaya bisa didapatkan informasi akun. Contohnya yaitu dalam kode ini ada script untuk mengambil foto profil dari akun google.
```ts
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const logout = () => {
    authStore.logout();
};

const userPhoto = ref(user.value?.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg');

function handleImageError() {
    userPhoto.value = 'https://ionicframework.com/docs/img/demos/avatar.svg';
}
```

# CRUD Menggunakan Firebase

## Tambah ToDo dan Edit Todo

InputModal.vue
1. Pada halaman ini meminta inputan dari pengguna untuk menambah todo dan update todo

```html
<template>
    <ion-modal :is-open="isOpen" @did-dismiss="cancel">
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ editingId ? 'Edit' : 'Add' }} Todo</ion-title>
                <ion-buttons slot="start">
                    <ion-button @click="cancel"><ion-icon :icon="close"></ion-icon></ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-item>
                <ion-input v-model="todo.title" label="Title" label-placement="floating"
                    placeholder="Enter Title"></ion-input>
            </ion-item>
            <ion-item>
                <ion-textarea v-model="todo.description" label="Description" label-placement="floating"
                    placeholder="Enter Description" :autogrow="true" :rows="3"></ion-textarea>
            </ion-item>
            <ion-row>
                <ion-col>
                    <ion-button type="button" @click="input" shape="round" color="primary" expand="block">
                        {{ editingId ? 'Edit' : 'Add' }} Todo
                    </ion-button>
                </ion-col>
            </ion-row>
        </ion-content>
    </ion-modal>
</template>
```

2. Pada Halaman ini juga menggunakan script ts untuk menentukan apakah akan edit atau tambah
```ts
const props = defineProps<{
    isOpen: boolean,
    editingId: string | null,
    todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'status'>
}>();

const emit = defineEmits<{
    'update:isOpen': [value: boolean],
    'update:editingId': [value: string | null],
    'submit': [item: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'status'>]
}>();

const cancel = () => {
    emit('update:isOpen', false);
    emit('update:editingId', null);
    props.todo.title = '';
    props.todo.description = '';
}
const input = () => {
    emit('submit', props.todo);
    cancel();
}
```

3. Tambah todo menggunakan method AddTodos di firestore.ts
```ts
async addTodo(todo: Omit<Todo, 'id'>) {
        try {
            const todoRef = this.getTodoRef();
            const docRef = await addDoc(todoRef, {
                ...todo,
                status: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error Tambah Todo:', error);
            throw error;
        }
    },
```

Halaman Tambah
![Tambah](gambar/addtodo.png)

Halaman Edit
![Edit](gambar/edit3.png)]


## Tampil Data

1. Menampilkan data dokumen yang berasal dari akun yang sudah login
```ts
// get collection ref
    getTodoRef() {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error('User not authenticated');
        return collection(db, 'users', uid, 'todos');
    },
```

2. Data ditampilkan pada HomePage.vue berasal dari firestore yang menggunakan fungsi getTodos() pada firestore.ts
```ts
// read
    async getTodos(): Promise<Todo[]> {
        try {
            const todoRef = this.getTodoRef();
            const q = query(todoRef, orderBy('updatedAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            } as Todo));
        } catch (error) {
            console.error('Error Get Todos:', error);
            throw error;
        }
    },
```

3. Data ditampilkan dengan kode berikut pada HomePage.vue. data ditampilkan pada siding-card
```html
<ion-item-sliding
                    v-for="todo in completedTodos"
                    :key="todo.id"
                    :ref="(el) => setItemRef(el, todo.id!)">
                    <ion-item-options
                      side="start"
                      @ionSwipe="handleDelete(todo)">
                      <ion-item-option
                        color="danger"
                        expandable
                        @click="handleDelete(todo)">
                        <ion-icon
                          slot="icon-only"
                          :icon="trash"
                          size="large"></ion-icon>
                      </ion-item-option>
                    </ion-item-options>

                    <ion-item>
                      <ion-card>
                        <ion-card-header>
                          <ion-card-title class="ion-text-wrap limited-text">{{
                            todo.title
                          }}</ion-card-title>
                          <ion-card-subtitle class="limited-text">{{
                            todo.description
                          }}</ion-card-subtitle>
                        </ion-card-header>

                        <ion-card-content>
                          <ion-badge>{{
                            getRelativeTime(todo.updatedAt)
                          }}</ion-badge>
                        </ion-card-content>
                      </ion-card>
                    </ion-item>

                    <ion-item-options side="end" @ionSwipe="handleStatus(todo)">
                      <ion-item-option @click="handleEdit(todo)">
                        <ion-icon
                          slot="icon-only"
                          :icon="create"
                          size="large"></ion-icon>
                      </ion-item-option>
                      <ion-item-option
                        color="warning"
                        expandable
                        @click="handleStatus(todo)">
                        <ion-icon
                          slot="icon-only"
                          :icon="close"
                          color="light"
                          size="large"></ion-icon>
                      </ion-item-option>
                    </ion-item-options>
                  </ion-item-sliding>
```

![Tampil data](gambar/addtodoberhasil.png)

## Hapus data 

Hapus Data dilakukan dengan menarik sliding card dari kiri ke kanan sampai muncul ikon sampah.
```html
<ion-item-options
                      side="start"
                      @ionSwipe="handleDelete(todo)">
                      <ion-item-option
                        color="danger"
                        expandable
                        @click="handleDelete(todo)">
                        <ion-icon
                          slot="icon-only"
                          :icon="trash"
                          size="large"></ion-icon>
                      </ion-item-option>
                    </ion-item-options>
```

2. Swipe akan memanggil method handleDelete()
```ts
const handleDelete = async (deleteTodo: Todo) => {
  try {
    await firestoreService.deleteTodo(deleteTodo.id!);
    await showToast("Todo deleted successfully", "success", checkmarkCircle);
    loadTodos();
  } catch (error) {
    await showToast("Failed to delete todo", "danger", closeCircle);
    console.error(error);
  }
};
```

3. kemudian handleDelete memanggil DeleteTodos di firestore.ts untuk melakukan penghapusan dokumen dari database firestore
```ts
async deleteTodo(id: string) {
        try {
            const todoRef = this.getTodoRef();
            const docRef = doc(todoRef, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error Delete Todo:', error);
            throw error;
        }
    },
```
![Hapus](gambar/hapus.png)


## Update

1. Tombol edit akan muncul jika slidingcard todos digeser dari kanan ke kiri
```html
<ion-item-options side="end" @ionSwipe="handleStatus(todo)">
                      <ion-item-option @click="handleEdit(todo)">
                        <ion-icon
                          slot="icon-only"
                          :icon="create"
                          size="large"></ion-icon>
                      </ion-item-option>
```

2. Jika tombol edit ditekan akan memanggil method handleEdit() yang membuat isOpen true untuk membuka inputmodal edit
```ts
// handle edit click
const handleEdit = async (editTodo: Todo) => {
  const slidingItem = itemRefs.value.get(editTodo.id!);
  await slidingItem?.close();

  editingId.value = editTodo.id!;
  todo.value = {
    title: editTodo.title,
    description: editTodo.description,
  };
  isOpen.value = true;
};
```

3. Handleedit memanggil method updateTodos di firestore.ts
```ts
async updateTodo(id: string, todo: Partial<Todo>) {
        try {
            const todoRef = this.getTodoRef();
            const docRef = doc(todoRef, id);
            await updateDoc(docRef, {
                ...todo,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error Update Todo:', error);
            throw error;
        }
    },
```

![Update](gambar/edit1.png)
![Update](gambar/edit2.png)
![Update](gambar/edit4.png)


## Complete
Update "status" pada dokumen di firebase menjadi true dari yang awalnya false.

1. Jika sliding card digeser dari kanan ke kiri akan memanggil method handleStatus
```html
<ion-item-option
        color="warning"
        expandable
        @click="handleStatus(todo)">
        <ion-icon
        slot="icon-only"
        :icon="close"
         color="light"
        size="large"></ion-icon>
</ion-item-option>
```
2.  handleStatus akan menggunakan fitur update untuk mengubah pada "status" dari dokumen todo tersebut akan diupdate dari false ke true.
```ts
const handleStatus = async (statusTodo: Todo) => {
  const slidingItem = itemRefs.value.get(statusTodo.id!);
  await slidingItem?.close();
  try {
    await firestoreService.updateStatus(statusTodo.id!, !statusTodo.status);
    await showToast(
      `Todo marked as ${!statusTodo.status ? "completed" : "active"}`,
      "success",
      checkmarkCircle
    );
    loadTodos();
  } catch (error) {
    await showToast("Failed to update status", "danger", closeCircle);
    console.error(error);
  }
};
```
![Selesai Tombol](gambar/selesai2.png)
![Selesai Tombol](gambar/selesai3.png)
