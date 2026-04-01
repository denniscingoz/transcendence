import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useMyProfile, useUpdateProfile, useChangePassword } from '../hooks/useProfile'
import type { UpdateProfileDto, ChangePasswordDto } from '../types/api'

type EditProfileForm = {
  FullName: string
  Username: string
  Bio: string
  AvatarUrl: string
}

const DUMMY_PROFILE_FORM: EditProfileForm = {
  FullName: 'Micha',
  Username: 'michauser',
  Bio: 'Bio details for Micha',
  AvatarUrl:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
}

export function EditProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    data: myProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useMyProfile()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()


  const [profileForm, setProfileForm] = useState<EditProfileForm>({
    FullName: '',
    Username: '',
    Bio: '',
    AvatarUrl: '',
  })
  const [originalProfileForm, setOriginalProfileForm] = useState<EditProfileForm | null>(null)

  const [passwordForm, setPasswordForm] = useState<ChangePasswordDto>({
    CurrentPassword: '',
    NewPassword: '',
  })

  useEffect(() => {
    if (!myProfile) return

    const mappedProfile: EditProfileForm = {
      FullName: myProfile.FullName || DUMMY_PROFILE_FORM.FullName,
      Username: myProfile.Username || DUMMY_PROFILE_FORM.Username,
      Bio: myProfile.Bio ?? DUMMY_PROFILE_FORM.Bio,
      AvatarUrl: myProfile.AvatarUrl ?? DUMMY_PROFILE_FORM.AvatarUrl,
    }

    setProfileForm(mappedProfile)
    setOriginalProfileForm(mappedProfile)
  }, [myProfile])

  useEffect(() => {
    if (!isProfileError || myProfile || originalProfileForm) return
    setProfileForm(DUMMY_PROFILE_FORM)
    setOriginalProfileForm(DUMMY_PROFILE_FORM)
  }, [isProfileError, myProfile, originalProfileForm])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!originalProfileForm) return

    const payload: Partial<UpdateProfileDto> = {}

    if (profileForm.FullName !== originalProfileForm.FullName) {
      payload.FullName = profileForm.FullName
    }

    if (profileForm.Username !== originalProfileForm.Username) {
      payload.Username = profileForm.Username
    }

    if (profileForm.Bio !== originalProfileForm.Bio) {
      payload.Bio = profileForm.Bio.length > 0 ? profileForm.Bio : null
    }

    if (profileForm.AvatarUrl !== originalProfileForm.AvatarUrl) {
      payload.AvatarUrl = profileForm.AvatarUrl.length > 0 ? profileForm.AvatarUrl : null
    }

    if (Object.keys(payload).length === 0) {
      return
    }

    const updated = await updateProfile.mutateAsync(payload)
    setOriginalProfileForm({
      FullName: updated.FullName,
      Username: updated.Username,
      Bio: updated.Bio ?? '',
      AvatarUrl: updated.AvatarUrl ?? '',
    })
  }

  async function handleChangePassword(e: React.FormEvent) {
  e.preventDefault()

      if (!passwordForm.CurrentPassword || !passwordForm.NewPassword) {
        return
      }
    
    
      await changePassword.mutateAsync({
        CurrentPassword: passwordForm.CurrentPassword,
        NewPassword: passwordForm.NewPassword,
      })
    
      setPasswordForm({
        CurrentPassword: '',
        NewPassword: '',
      })
  }

  function handleDiscard() {
    navigate(-1)
  }
  
  function handleClose() {
    navigate(-1)
  }

  if (isProfileLoading) {
    return (
      <div className="h-[calc(100dvh-250px)] bg-bg px-4 py-8">
        <div className="mx-auto max-w-3xl text-text">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100dvh-250px)] bg-bg px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {/* {Form with Bio, Name, Username, AvatarUrl && and includes close x with Edit header} */}
        <form
          onSubmit={handleSaveProfile}
          className="panel rounded-2xl border border-panel p-6 shadow-sm"
        >
        {/* {Close x and Edit header} */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-text">{t('editprofile.editprofile')}</h1>
            
            <button
              type="button"
              onClick={handleClose}
              className="btn-ghost flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-text hover:bg-gray-100"
              aria-label="Close settings"
            >
              ×
            </button>
          </div>
            
        {/* {AvatarUrl} */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <img
                src={profileForm.AvatarUrl || '/avatar-placeholder.png'}
                alt="Profile avatar"
                className="h-24 w-24 rounded-full object-cover ring-2 ring-panel"
              />

              <button
                type="button"
                className="btn-ghost h-[40px] min-w-[140px] text-sm rounded-xl px-4"
              >
                {t('editprofile.changephoto')}
              </button>
            </div>

          {/* {Bio} */}
            <div className="flex flex-col gap-2">
              <label htmlFor="bio" className="text-sm font-medium text-text">
                {t('editprofile.bio')}
              </label>
              <textarea
                id="bio"
                value={profileForm.Bio}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, Bio: e.target.value }))
                }
                rows={4}
                className="w-full rounded-xl border border-panel px-4 py-3 outline-none focus:border-black"
              />
            </div>

          {/* {FullName} */}
            <div className="flex flex-col gap-2">
              <label htmlFor="fullName" className="text-sm font-medium text-text">
                {t('editprofile.fullname')}
              </label>
              <input
                id="fullName"
                type="text"
                value={profileForm.FullName}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, FullName: e.target.value }))
                }
                className="h-11 w-full rounded-xl border border-panel px-4 outline-none focus:border-black"
              />
            </div>

          {/* {Username} */}
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-sm font-medium text-text">
                {t('editprofile.username')}
              </label>
              <input
                id="username"
                type="text"
                value={profileForm.Username}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, Username: e.target.value }))
                }
                className="h-11 w-full rounded-xl border border-panel px-4 outline-none focus:border-black"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="btn-ghost rounded-xl px-5 py-2 text-sm"
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? t('editprofile.saving') : t('editprofile.savechanges')}
              </button>

              <button
                type="button"
                onClick={handleDiscard}
                className="btn-ghost rounded-xl px-5 py-2 text-sm font-medium"
              >
                {t('editprofile.discard')}
              </button>
            </div>
          </div>
        </form>

        <form
          onSubmit={handleChangePassword}
          className="panel rounded-2xl border border-panel p-6 shadow-sm"
        >
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-text"> {t('editprofile.changepassword')}</h2>

            <div className="flex flex-col gap-2">
              <label htmlFor="oldPassword" className="text-sm font-medium text-text">
                {t('editprofile.oldpassword')}
              </label>
              <input
                id="oldPassword"
                type="password"
                value={passwordForm.CurrentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    CurrentPassword: e.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-panel px-4 outline-none focus:border-black"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-text">
                {t('editprofile.newpassword')}
              </label>
              <input
                id="newPassword"
                type="password"
                value={passwordForm.NewPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    NewPassword: e.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-panel px-4 outline-none focus:border-black"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="btn-ghost rounded-xl px-5 py-2 text-sm font-medium"
              >
                {t('editprofile.changepassword')}
              </button>

              <button
                type="button"
                onClick={handleDiscard}
                className="btn-ghost rounded-xl px-5 py-2 text-sm font-medium"
              >
                 {t('editprofile.discard')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}