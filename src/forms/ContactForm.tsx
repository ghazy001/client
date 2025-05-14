import { toast } from 'react-toastify';
import BtnArrow from '../svg/BtnArrow';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';

interface FormData {
    user_name: string;
    user_email: string;
    message: string;
}

const schema = yup
    .object({
        user_name: yup.string().required("Le nom est requis."),
        user_email: yup.string().required("L'e-mail est requis.").email("Format d'e-mail invalide."),
        message: yup.string().required("Le message est requis."),
    })
    .required();

const ContactForm = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: yupResolver(schema),
    });

    const sendEmail = async (data: FormData) => {
        try {
            const response = await fetch("http://localhost:3000/reclamation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: data.user_name,
                    email: data.user_email,
                    comment: data.message,
                }),
            });

            if (response.ok) {
                toast.success("Message envoyé avec succès", { position: "top-center" });
                reset();
            } else {
                const resData = await response.json();
                toast.error(resData.error || "Échec de l'envoi", { position: "top-center" });
            }
        } catch (err) {
            console.error(err);
            toast.error("Erreur de connexion au serveur", { position: "top-center" });
        }
    };

    return (
        <form onSubmit={handleSubmit(sendEmail)} id="contact-form">
            <div className="form-grp">
                <textarea {...register("message")} placeholder="Commentaire *" required></textarea>
                <p className="form_error">{errors.message?.message}</p>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-grp">
                        <input {...register("user_name")} type="text" placeholder="Nom *" required />
                        <p className="form_error">{errors.user_name?.message}</p>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-grp">
                        <input {...register("user_email")} type="email" placeholder="Email *" required />
                        <p className="form_error">{errors.user_email?.message}</p>
                    </div>
                </div>
            </div>
            <button type="submit" className="btn btn-two arrow-btn">Envoyer <BtnArrow /></button>
        </form>
    );
};

export default ContactForm;
