// ==========================================
// GOOGLE-REKIN SAIOA HASI
// ==========================================

loginGoogle.addEventListener(
    "click",
    async function () {

        try {

            const resultado =
                await signInWithPopup(
                    auth,
                    proveedorGoogle
                );


            const usuario =
                resultado.user;


            console.log(
                "Erabiltzailea konektatuta:",
                usuario
            );


            console.log(
                "Erabiltzailearen IDa:",
                usuario.uid
            );

        }

        catch (error) {

            console.error(
                "Errorea saioa hastean:",
                error
            );

        }

    }
);


// ==========================================
// ERABILTZAILEAREN SAIOA EGIAZTATU
// ==========================================

onAuthStateChanged(
    auth,

    function (usuario) {

        if (usuario) {

            // ==================================
            // ERABILTZAILEA KONEKTATUTA
            // ==================================

            console.log(
                "Erabiltzailea autentifikatuta:",
                usuario.email
            );


            console.log(
                "Erabiltzailearen IDa:",
                usuario.uid
            );


            usuarioActual.textContent =
                "Konektatuta: " +
                usuario.email;


            loginGoogle.textContent =
                "Saioa hasita";


            loginGoogle.disabled =
                true;

        }

        else {

            // ==================================
            // EZ DAGO ERABILTZAILE KONEKTATURIK
            // ==================================

            console.log(
                "Ez dago erabiltzaile konektaturik"
            );


            usuarioActual.textContent =
                "Ez duzu saioa hasi";


            loginGoogle.textContent =
                "Google-rekin jarraitu";


            loginGoogle.disabled =
                false;

        }

    }
);
