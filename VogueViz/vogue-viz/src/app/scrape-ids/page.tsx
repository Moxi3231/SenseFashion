"use client";
import { useState } from "react";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation'




export default function scrapeData() {
    
    const uploadScrapeIds = async () => {
        const fileElement = document.getElementById('scrapeFile');
        if(fileElement == null){
            return;
        }
        if(fileElement.files == null || fileElement.files.length == 0){
            return;
        }
        const id_file = fileElement.files[0];
        const formData = new FormData();
        formData.append("scrapeFile", id_file);

        fetch("/api/uploadScrapeIds", {
            method: "POST",
            body: formData,
          })

    };
    return (<>
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8"> {/* Larger width */}
          <div className="card shadow-lg">
            <div className="card-header text-center bg-light text-dark py-4"> {/* Added padding for more space */}
              <h2>Upload Scrape File</h2> {/* Larger heading */}
            </div>
            <div className="card-body p-5"> {/* Increased padding for a more spacious feel */}

                <div className="form-group mb-4"> {/* Added margin-bottom for spacing */}
                  <label htmlFor="scrapeFile" className="font-weight-bold mb-3"> {/* More space below label */}
                    Choose Excel File:
                  </label> &nbsp;
                  <input
                    type="file"
                    className="form-control-file"
                    id="scrapeFile"
                    name="scrape-id"
                    accept=".xlsx"
                  />
                </div>
                <div className="d-flex justify-content-center mt-4">
                  <button 
                    onClick={uploadScrapeIds}
                    className={`btn btn-lg `} 
                  >
                    Upload
                  </button>
                </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    </>
    );
}
