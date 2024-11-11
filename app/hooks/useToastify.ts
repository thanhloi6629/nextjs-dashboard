import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";


const useToastify = () => {
    const successNotification = () => {
        toast.success("Success Notification !", {
            position: "top-center"
          });
    }

    const errorNotification = () => {
        toast.error("Error Notification !", {
            position: "top-left"
          });
    }
   
   return {
    successNotification,
    errorNotification
   }
    
}
export default useToastify;