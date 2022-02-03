With Leapp you can group and activate more than one credential set at a time through [Named Profiles](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html).

## Named Profiles

Named Profiles are a way AWS uses to maintain more than one set of credentials active for you to use with AWS-CLI, SDK, or other third-party tools. Named profiles are stored in *~/.aws/credentials* file in the **ini** file format.

Named Profiles have a default profile which is the one you get from [aws configure](https://docs.aws.amazon.com/cli/latest/reference/configure/) command.

## Create a new Named Profile

Named Profiles can be created in **3 ways**:

=== "Option Panel"

    Click on the gear icon <img width="24" alt="Screenshot 2022-02-03 at 15 22 34" src="https://user-images.githubusercontent.com/9497292/152361141-75b5edec-f68f-47af-9a72-fd189706cb2a.png"> and go to **Options**. 
    Find the **Profiles** tab, and click on the plus icon.

=== "When creating a new Session"

    When creating a new session a selector will be available to choose or **add** a new profile.

=== "Edit Profile in Contextual Menu"

    Right-click on a session and select **Change** then **Named Profile**: an option to select or add a new profile will be available.
    <br><br>
    <img width="560" alt="Screenshot 2022-02-03 at 15 25 43" src="https://user-images.githubusercontent.com/9497292/152361872-0f52d40b-7c02-4dce-999c-c1bd2db517af.png">

!!! info

    Named Profiles are selectable directly when creating an AWS access method (IAM Federated Role, 
    IAM Chained Role, IAM User or IAM SSO Role), by using the selector provided in the form.

It is also possible to create a new named profile directly from the selector by typing a new name and by pressing ENTER key.


The new name is directly added to the named profile list and it will be possible to use it for other sessions too.

AWS SSO sessions will have default as named profile when obtained through Login or Sync, to change the named profile associated to a session you have to use the "Change Profile" option in the session list.

Named Profile List
Named profiles can be managed from the option page.


Here you can add or edit a new named profile, you can also remove unwanted named profiles. When removing a named profile, Leapp will give you a hint on modified sessions, and those sessions will be reverted to default named profile.

The input form can be used for adding or editing a named profile: when empty you can use it to add a new named profile. When selecting the <img width="32" alt="Screenshot 2022-02-03 at 15 32 11" src="https://user-images.githubusercontent.com/9497292/152363026-6b933ce9-6ad1-4ae6-a6db-eefa5769764e.png"> button, the input field will be filled and you can change the name of the named profile associated with all sessions already linked to that profile.

A named profile can also be changed directly from an AWS session element in the main list.

There you can add or select a new named profile the same way you would from the add session form.

Remember that when you change a session's profile the session is put immediately in stop mode, that's because we have changed the credential file, so you'll need to restart it again.
