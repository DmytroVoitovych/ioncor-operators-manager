import { ref } from 'vue';
import domtoimage from 'dom-to-image-more';

const C_SHIFT = import.meta.env.VITE_C_SHIFT_GROUP;
const SENDER_SERVICE = import.meta.env.VITE_TELEGRAM_SENDER_SERVICE;

const sendToChat = async (blob: Blob, chatId: string,title:string) => {
  const form = new FormData()
  form.append("file", blob, title)
  form.append("chat_id", chatId)

  await fetch(SENDER_SERVICE, {
    method: "POST",
    body: form,
  })
};

export const useScreenshot = () =>{
  const isCapturing = ref(false);

  const captureAndDownload = async (el: HTMLElement,filename = 'screenshot.png') => {
    if (!el) return;
    isCapturing.value = true;

    try {
      const blob = await  domtoimage.toBlob(el,{bgcolor:'#fff'});
      const link = document.createElement('a');

      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      await sendToChat(blob,C_SHIFT,filename);
    } catch (err) {
      console.error('Error in creating a screenshot:', err);
    } finally {
      isCapturing.value = false;
    }
  }

  return {
    isCapturing,
    captureAndDownload,
  }
};
