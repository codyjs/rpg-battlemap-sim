import { createElement, Fragment, useState, FC } from 'react';
import { Link } from 'react-router-dom';

export const UploadPiece: FC<{}> = () => {
    const [image, setImage] = useState(null);
    const [imageName, setImageName] = useState(null);

    const onImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImage(e.target.files[0]);
        const filename = e.target.files[0].name;
        setImageName(filename.slice(0, filename.lastIndexOf('.')));
    }

    const uploadPiece = () => {
        const formData = new FormData();
        formData.append('data', JSON.stringify({ imageName }));
        formData.append('image', image);
        fetch('/api/pieces', {
            method: 'POST',
            body: formData
        });
    };

    return (
        <div className="left-bar">
            <h1>Add Piece</h1>
            <Link to="/">&lt;&lt; Back</Link>
            <label htmlFor="image-upload" className="custom-file-upload" style={{marginTop: '10px'}}>Select Image</label>
            <input id="image-upload" type="file" onChange={onImageSelect}/>
            {image ? (
                <Fragment>
                    <label htmlFor="name">Name:</label>
                    <input id="name" value={imageName} onChange={(e) => setImageName(e.target.value)} />
                    <button onClick={() => uploadPiece()}>Save</button>
                </Fragment>
            ) : null}
        </div>
    );
}