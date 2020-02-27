import { createElement, Fragment, useState, FC, ReactNode } from 'react';
import { BackButton } from '../../components/back-button/back-button';
import { NavbarList } from '../../components/navbar-list';
import { Redirect } from 'react-router-dom';

export const UploadPiece: FC<{}> = () => {
    const [image, setImage] = useState<File>(null);
    const [imageSrc, setImageSrc] = useState<string | ArrayBuffer>(null);
    const [imageName, setImageName] = useState<string>(null);
    const [saved, setSaved] = useState(false);

    const onImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImage(e.target.files[0]);
        const filename = e.target.files[0].name;
        setImageName(filename.slice(0, filename.lastIndexOf('.')));
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            setImageSrc(e.target.result);
        }
        fileReader.readAsDataURL(e.target.files[0]);
    }

    const uploadPiece = () => {
        const formData = new FormData();
        formData.append('data', JSON.stringify({ imageName }));
        formData.append('image', image);
        fetch('/api/pieces', {
            method: 'POST',
            body: formData
        }).then(() => setSaved(true));
    };

    if (saved) return <Redirect to="/pieces" />

    return (
        <Fragment>
            <div className="left-bar">
                <h2>Upload Piece</h2>
                <NavbarList children={[<BackButton to="/pieces" />]} />
                <Fragment>
                    <label htmlFor="image-upload" className="custom-file-upload" style={{marginTop: '10px'}}>Select Image</label>
                    <input id="image-upload" type="file" onChange={onImageSelect}/>
                </Fragment>
                {image ? (
                    <Fragment>
                        <label htmlFor="name">Name:</label>
                        <input id="name" value={imageName} onChange={(e) => setImageName(e.target.value)} />
                        <button onClick={() => uploadPiece()}>Save</button>
                    </Fragment>
                ) : null}
            </div>
            { imageSrc ? (
                <div style={{display: 'flex', flexDirection: 'column', backgroundColor: 'grey'}}>
                    Preview:
                    <img src={imageSrc.toString()} style={{width: '100px', height: '100px'}}/> 
                </div>
            ) : null }
        </Fragment>
    );
}