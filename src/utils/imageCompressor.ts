// 1. 단일 이미지 압축 함수 (기존 로직 유지)
export async function compressImage(file: File): Promise<File> {
  const MAX_WIDTH = 300;
  const MAX_HEIGHT = 300;
  const COMPRESSION_QUALITY = 0.7; // 화질 70%

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // 크기 조정 로직 (긴 변을 300px로 맞춤)
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        // Canvas에 그리기
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // 이미지 렌더링 (리사이징 적용됨)
        ctx.drawImage(img, 0, 0, width, height);

        // Blob으로 변환 후 File 객체 생성
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Image compression failed'));
            }
          },
          file.type,
          COMPRESSION_QUALITY
        );
      };

      img.onerror = (error) => reject(error);
    };

    reader.onerror = (error) => reject(error);
  });
}

// 2. 다중/단일 이미지 압축 지원 함수 (추가됨)
// MovieTab 등에서 compressImages 이름으로 호출할 때 대응
export async function compressImages(input: File | File[]): Promise<File | File[]> {
  if (Array.isArray(input)) {
    // 배열인 경우: 모든 이미지를 병렬로 압축
    return Promise.all(input.map((file) => compressImage(file)));
  } else {
    // 단일 파일인 경우: 그냥 compressImage 호출
    return compressImage(input);
  }
}