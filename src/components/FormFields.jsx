import React from 'react';
/** Campo accesible reutilizable: props controlan etiqueta, error y eventos. */
export function Field({name,label,error,as='input',children,...props}){
 const id='field-'+name, errorId=id+'-error';
 const common={id,name,'aria-invalid':Boolean(error),'aria-describedby':error?errorId:undefined,className:'form-control'+(error?' is-invalid':''),...props};
 return <div className="field-wrap">
  <label htmlFor={id}>{label}</label>
  {as==='select'?<select {...common}>{children}</select>:as==='textarea'?<textarea {...common}/>:<input {...common}/>}
  {error&&<div id={errorId} className="field-error" role="alert">{error}</div>}
 </div>;
}
export function Alert({children,type='info'}){return <div role="alert" className={'inline-alert '+type}>{children}</div>}
