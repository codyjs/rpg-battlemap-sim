import { createElement, Fragment, useState } from 'react';
import { Link } from 'react-router-dom';

export const UploadImage = () => {
    const [image, setImage] = useState(null);
    const [imageName, setImageName] = useState(null);
    const [imageType, setImageType] = useState('piece');

    const onImageSelect = e => {
        setImage(e.target.files[0]);
        const filename = e.target.files[0].name;
        setImageName(filename.slice(0, filename.lastIndexOf('.')));
    }

    const uploadImage = () => {
        const formData = new FormData();
        formData.append('data', JSON.stringify({ imageName, imageType }));
        formData.append('image', image);
        fetch('/api/images', {
            method: 'POST',
            body: formData
        });
    };

    return (
        <div className="left-bar">
            <h1>Upload Image</h1>
            <Link to="/">&lt;&lt; Back</Link>
            <label htmlFor="image-upload" className="custom-file-upload" style={{marginTop: '10px'}}>Select Image</label>
            <input id="image-upload" type="file" onChange={onImageSelect}/>
            {image ? (
                <Fragment>
                    <label htmlFor="name">Name:</label>
                    <input id="name" value={imageName} onChange={(e) => setImageName(e.target.value)} />
                    <label>Piece</label>
                    <input type="radio" name="image-type" value="piece" checked={imageType === 'piece'} onChange={(e) => !e.target.checked || setImageType('piece')} />
                    <label>Backdrop</label>
                    <input type="radio" name="image-type" value="backdrop" checked={imageType === 'backdrop'} onChange={(e) => !e.target.checked || setImageType('backdrop')}/>
                    <button onClick={() => uploadImage()}>Save</button>
                </Fragment>
            ) : null}
        </div>
    );
}