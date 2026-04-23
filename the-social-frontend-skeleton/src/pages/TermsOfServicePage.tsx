import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { TheSocialLogo } from "../components/Header"
import { Link } from "react-router-dom"

export function TermsOfServicePage()
{
	const { t } = useTranslation()
	const navigate = useNavigate()

	function handleClose() {
		 navigate(-1)
	}

	return (
		<div  className="h-[calc(100dvh-250px)] bg-bg px-4 py-16">
			{/* LOGO */}
			<h1 className="flex justify-center pb-8">
					  <TheSocialLogo className="h-4 w-auto text-gray-900" />
			</h1>
			
			{/* PANEL */}
			<div className="panel mx-auto max-w-4xl rounded-2xl border border-panel bg-white p-6 shadow-sm">
					
					{/* {Close x and Privacy header} */}
				<div className="mb-8 flex items-center justify-between">
					
					{/* Header */}
					<h1 className="text-2xl font-semibold text-text">{t('termsService.header')}</h1>
	
					{/* Close Button */}
					  <button
						type="button"
						onClick={handleClose}
						className="btn-ghost flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-text hover:bg-gray-100"
						aria-label="Close settings"
					  >
						×
					  </button>

				</div>
				
				<div className="bg-white flex items-center justify-between gap-4 rounded-xl border border-panel px-4 py-4">

					{/* Body */}
					<div>
						<p className="body pt-8 whitespace-pre-line">{t('termsService.body')}</p>
					</div>

				</div>	
			
			</div>
			 <div className="flex justify-center gap-2 pb-4">
				<Link to="/privacy-policy" className="text-sm text-gray-600 hover:underline">
				   {t('privacyPolicy.header')}
				 </Link>  
			</div>
		</div>
	)
}