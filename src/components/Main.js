import React from 'react';

function Main({ captureFile, uploadVideo, currentPost, videos, changeVideo }) {
  
  return (
    <div className="container-fluid text-monospace">
    <br></br>
    &nbsp;
    <br></br>
      <div className="row">
        <div className="col-md-10">
          <div className="embed-responsive embed-responsive-16by9" style={{ maxHeight: '768px'}}>
            <video
              src={currentPost.hash}
              controls
            />
          </div>
          <h3>{currentPost.title}</h3>
        </div>
        <div className="col-md-2 overflow-auto text-center" style={{ maxHeight: '768px', minWidth: '175px' }}>
          <h5><b>Share Video</b></h5>
          <form onSubmit={(e) => {
            e.preventDefault()
            const title = e.target.videoTitle.value
            uploadVideo(title) 
          }} >
            &nbsp;
            <input 
              type='file'
              accept='.mp4, .mkv, .ogg, .wmv'
              className='form-control-sm'
              onChange={captureFile}
            />
            <div className="form-group mr-sm-3">
              <input 
                id="videoTitle"
                type='text'
                className='form-control-sm'
                placeholder='Title...'
                required
              />
            </div>
            <button type='submit' className='btn btn-danger btn-block btn-sm'>UPLOAD NOW!</button>
            &nbsp;
          </form>
            {
              videos.map((video, index) => {
                return (
                  <div key={Math.random()*index} style={{ width: '175px', cursor: 'pointer'}}>
                    <div className="card-title bg-dark">
                      <small className="text-white"><b>{video.title}</b></small>
                    </div>
                    <div>
                      <p onClick={() => changeVideo(video.hash, video.title)}>
                        <video 
                          src={`https://ipfs.infura.io/ipfs/${video.hash}`}
                          style={{width: 150}}
                          controls
                        />
                      </p>
                    </div>
                  </div>
                )
              })
            }
        </div>
      </div>
    </div>
  );
}

export default Main;